import cors from "cors";
import crypto from "crypto";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { all, get, initSchema, run } from "./db.js";
import { diagnosticarFoto } from "./ia.js";
import { persistirHallazgo, reanalizarPendientes, refrescarRespuestasCatalogo } from "./fotos.js";
import {
  compactarFoto,
  fotoCampos,
  hidratarArchivos,
  leerBytes,
  rutaSegura,
} from "./archivo.js";
import { catalogoDir, listarEnfermedades } from "./catalogo.js";
import { listarProductos } from "./org.js";
import { climaTingo } from "./clima.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const UPLOADS = path.join(ROOT, "data", "uploads");
const PORT = Number(process.env.PORT || 8787);

fs.mkdirSync(UPLOADS, { recursive: true });

function hash(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function token() {
  return crypto.randomBytes(24).toString("hex");
}

function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const raw = header.replace("Bearer ", "");
    if (!raw) return res.status(401).json({ error: "Sin sesión" });
    const session = await get("SELECT * FROM sessions WHERE token = ?", [raw]);
    if (!session) return res.status(401).json({ error: "Sesión inválida" });
    const user = await get("SELECT * FROM users WHERE id = ?", [session.user_id]);
    if (!user) return res.status(401).json({ error: "Usuario no existe" });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No autorizado para este rol" });
    }
    next();
  };
}

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapFoto(f, extra = {}) {
  return {
    id: f.id,
    loteId: f.lote_id,
    url: `/uploads/${f.filename}`,
    cultivo: f.cultivo,
    calidadPlanta: f.calidad_planta,
    enfermedad: f.enfermedad,
    confianzaEnfermedad: f.confianza_enfermedad,
    maleza: f.maleza,
    confianzaMaleza: f.confianza_maleza,
    tratamiento: f.tratamiento,
    tipo: f.tipo,
    causa: f.causa,
    aviso: f.aviso || "",
    nombreCientifico: f.nombre_cientifico || "",
    match: f.match || null,
    similitud: f.similitud ?? f.confianza_enfermedad ?? 0,
    fotoCatalogo: f.catalogo_filename ? `/uploads/catalogo/${f.catalogo_filename}` : null,
    createdAt: f.created_at,
    ...extra,
  };
}

async function lotePublico(row) {
  if (!row) return null;
  const fotos = await all(
    `SELECT ${fotoCampos()} FROM fotos WHERE lote_id = ? ORDER BY created_at DESC`,
    [row.id],
  );
  const bitacora = await all(
    "SELECT * FROM bitacora WHERE lote_id = ? ORDER BY fecha DESC",
    [row.id],
  );
  return {
    id: row.id,
    productorId: row.productor_id,
    productor: row.productor,
    parcela: row.parcela,
    cultivo: row.cultivo,
    variedad: row.variedad,
    sistema: row.sistema,
    plantasHa: row.plantas_ha,
    areaHa: row.area_ha,
    fechaPoda: row.fecha_poda,
    semaforo: row.semaforo,
    diasCarenciaRestantes: row.dias_carencia,
    calidadExportPct: row.calidad_export,
    pasos: parseJson(row.pasos_json, []),
    ruta: parseJson(row.ruta_json, []),
    bitacora,
    fotos: fotos.map((f) => mapFoto(f)),
    acopioId: row.acopio_id,
    seleccion: row.seleccion || "pendiente",
  };
}

async function vistaUsuario(user) {
  const socio = user.dni
    ? await get("SELECT * FROM socios WHERE dni = ?", [user.dni])
    : null;
  const acopio = user.acopio_id
    ? await get("SELECT * FROM acopios WHERE id = ?", [user.acopio_id])
    : null;
  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    role: user.role,
    loteId: user.lote_id,
    comunidad: user.comunidad,
    dni: user.dni || null,
    acopioId: user.acopio_id || null,
    acopioNombre: acopio?.nombre || null,
    socio: Boolean(socio),
  };
}

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || ".jpg") || ".jpg";
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
    },
  }),
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));

app.get("/uploads/:file", wrap(async (req, res, next) => {
  const name = path.basename(String(req.params.file || ""));
  if (!name || name !== req.params.file) return next();
  const disk = rutaSegura(UPLOADS, name);
  if (disk && fs.existsSync(disk)) {
    return res.sendFile(path.resolve(disk));
  }
  const buf = await leerBytes(name);
  if (buf) {
    if (disk) fs.writeFileSync(disk, buf);
    return res.type("jpg").send(buf);
  }
  const meta = await get("SELECT catalogo_filename FROM fotos WHERE filename = ?", [name]);
  const ficha = meta?.catalogo_filename
    ? path.join(catalogoDir(), path.basename(String(meta.catalogo_filename)))
    : null;
  if (ficha && fs.existsSync(ficha)) {
    return res.sendFile(path.resolve(ficha));
  }
  return next();
}));

app.use("/uploads", express.static(UPLOADS));

app.get("/api/health", wrap(async (_req, res) => {
  await get("SELECT 1 AS ok");
  res.json({ ok: true });
}));

app.post(
  "/api/login",
  wrap(async (req, res) => {
    const { email, password } = req.body || {};
    const user = await get("SELECT * FROM users WHERE email = ?", [
      String(email || "").toLowerCase(),
    ]);
    if (!user || user.password_hash !== hash(String(password || ""))) {
      return res.status(401).json({ error: "Correo o clave incorrectos" });
    }
    const t = token();
    await run("INSERT INTO sessions VALUES (?,?,?)", [
      t,
      user.id,
      new Date().toISOString(),
    ]);
    res.json({
      token: t,
      user: await vistaUsuario(user),
    });
  }),
);

app.get(
  "/api/me",
  auth,
  wrap(async (req, res) => {
    res.json(await vistaUsuario(req.user));
  }),
);

app.get(
  "/api/lotes",
  auth,
  wrap(async (req, res) => {
    if (req.user.role === "agricultor") {
      const row = await get("SELECT * FROM lotes WHERE id = ?", [req.user.lote_id]);
      return res.json(row ? [await lotePublico(row)] : []);
    }
    if (req.user.role === "acopio") {
      const rows = await all("SELECT * FROM lotes WHERE acopio_id = ?", [
        req.user.acopio_id,
      ]);
      return res.json(await Promise.all(rows.map(lotePublico)));
    }
    const rows = await all(
      "SELECT * FROM lotes WHERE seleccion = 'seleccionado' ORDER BY productor",
    );
    res.json(await Promise.all(rows.map(lotePublico)));
  }),
);

app.get(
  "/api/lotes/:id",
  auth,
  wrap(async (req, res) => {
    const row = await get("SELECT * FROM lotes WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Lote no existe" });
    if (req.user.role === "agricultor" && row.id !== req.user.lote_id) {
      return res.status(403).json({ error: "Ese lote no es tuyo" });
    }
    if (req.user.role === "acopio" && row.acopio_id !== req.user.acopio_id) {
      return res.status(403).json({ error: "Ese lote no es de tu acopio" });
    }
    if (req.user.role === "exportadora" && row.seleccion !== "seleccionado") {
      return res.status(403).json({ error: "El acopio no seleccionó este lote" });
    }
    res.json(await lotePublico(row));
  }),
);

app.post(
  "/api/lotes/:id/bitacora",
  auth,
  wrap(async (req, res) => {
    const lote = await get("SELECT * FROM lotes WHERE id = ?", [req.params.id]);
    if (!lote) return res.status(404).json({ error: "Lote no existe" });
    if (req.user.role === "agricultor" && lote.id !== req.user.lote_id) {
      return res.status(403).json({ error: "Ese lote no es tuyo" });
    }
    const id = `b-${Date.now()}`;
    await run("INSERT INTO bitacora VALUES (?,?,?,?,?,?,?,?)", [
      id,
      lote.id,
      new Date().toISOString().slice(0, 10),
      req.body.tipo || "inspeccion",
      req.body.titulo || "Registro",
      req.body.nota || "",
      req.user.nombre,
      req.user.role,
    ]);
    res.json({ ok: true, id });
  }),
);

app.post(
  "/api/lotes/:id/fotos",
  auth,
  requireRole("agricultor"),
  upload.single("foto"),
  wrap(async (req, res) => {
    const lote = await get("SELECT * FROM lotes WHERE id = ?", [req.params.id]);
    if (!lote || lote.id !== req.user.lote_id) {
      return res.status(403).json({ error: "Ese lote no es tuyo" });
    }
    if (!req.file) return res.status(400).json({ error: "Falta la foto" });
    const packed = await compactarFoto(req.file.path);
    const cultivo = req.body.cultivo || lote.cultivo || "cacao";
    const hallazgo = await diagnosticarFoto(cultivo, packed.path);
    const id = `f-${Date.now()}`;
    await run(
      `INSERT INTO fotos
        (id,lote_id,user_id,filename,cultivo,calidad_planta,enfermedad,confianza_enfermedad,maleza,confianza_maleza,tratamiento,created_at,tipo,causa,archivo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
      id,
      lote.id,
      req.user.id,
      packed.filename,
      cultivo,
      hallazgo.calidadPlantaPct,
      hallazgo.enfermedad,
      hallazgo.confianzaEnfermedad,
      hallazgo.maleza,
      hallazgo.confianzaMaleza,
      hallazgo.tratamiento,
      new Date().toISOString(),
      hallazgo.tipo || null,
      hallazgo.causa || null,
      packed.buffer,
    ],
    );
    await persistirHallazgo(id, hallazgo);
    const nuevaCalidad =
      hallazgo.match === "ninguno"
        ? lote.calidad_export
        : Math.round(lote.calidad_export * 0.7 + hallazgo.calidadPlantaPct * 0.3);
    if (nuevaCalidad !== lote.calidad_export) {
      await run("UPDATE lotes SET calidad_export = ? WHERE id = ?", [
        nuevaCalidad,
        lote.id,
      ]);
    }
    await run("INSERT INTO bitacora VALUES (?,?,?,?,?,?,?,?)", [
      `b-${id}`,
      lote.id,
      new Date().toISOString().slice(0, 10),
      "inspeccion",
      `IA: ${hallazgo.enfermedad}`,
      `${hallazgo.causa || ""}. ${hallazgo.tratamiento}`,
      req.user.nombre,
      "agricultor",
    ]);
    res.json({
      id,
      url: `/uploads/${packed.filename}`,
      hallazgo,
      calidadExportPct: nuevaCalidad,
    });
  }),
);

app.delete(
  "/api/lotes/:id/fotos/:fotoId",
  auth,
  requireRole("agricultor", "acopio"),
  wrap(async (req, res) => {
    const lote = await get("SELECT * FROM lotes WHERE id = ?", [req.params.id]);
    if (!lote) return res.status(404).json({ error: "Lote no existe" });
    if (req.user.role === "agricultor" && lote.id !== req.user.lote_id) {
      return res.status(403).json({ error: "Ese lote no es tuyo" });
    }
    if (req.user.role === "acopio" && lote.acopio_id !== req.user.acopio_id) {
      return res.status(403).json({ error: "Ese lote no es de tu acopio" });
    }
    const foto = await get(
      `SELECT ${fotoCampos()} FROM fotos WHERE id = ? AND lote_id = ?`,
      [req.params.fotoId, lote.id],
    );
    if (!foto) return res.status(404).json({ error: "Esa foto no está en el lote" });
    await run("DELETE FROM fotos WHERE id = ?", [foto.id]);
    const archivo = path.join(UPLOADS, path.basename(String(foto.filename || "")));
    if (foto.filename && archivo.startsWith(UPLOADS) && fs.existsSync(archivo)) {
      fs.unlinkSync(archivo);
    }
    res.json({ ok: true, id: foto.id });
  }),
);

app.post(
  "/api/lotes/:id/fotos/actualizar-ia",
  auth,
  requireRole("agricultor", "acopio"),
  wrap(async (req, res) => {
    const lote = await get("SELECT * FROM lotes WHERE id = ?", [req.params.id]);
    if (!lote) return res.status(404).json({ error: "Lote no existe" });
    if (req.user.role === "agricultor" && lote.id !== req.user.lote_id) {
      return res.status(403).json({ error: "Ese lote no es tuyo" });
    }
    if (req.user.role === "acopio" && lote.acopio_id !== req.user.acopio_id) {
      return res.status(403).json({ error: "Ese lote no es de tu acopio" });
    }
    const r = await reanalizarPendientes(UPLOADS, lote.id);
    const respuestas = await refrescarRespuestasCatalogo(lote.id);
    const fotos = await all(
      `SELECT ${fotoCampos()} FROM fotos WHERE lote_id = ? ORDER BY created_at DESC`,
      [lote.id],
    );
    res.json({
      pendientes: r.pendientes,
      actualizadas: r.actualizadas.length,
      respuestas,
      fotos: fotos.map((f) => mapFoto(f)),
    });
  }),
);

app.get(
  "/api/catalogo/enfermedades",
  auth,
  wrap(async (req, res) => {
    const cultivo = typeof req.query.cultivo === "string" ? req.query.cultivo : "";
    const tipo = typeof req.query.tipo === "string" ? req.query.tipo : "";
    res.json(await listarEnfermedades(cultivo, tipo));
  }),
);

app.post(
  "/api/lotes/:id/prueba-catalogo",
  auth,
  requireRole("agricultor"),
  wrap(async (req, res) => {
    const lote = await get("SELECT * FROM lotes WHERE id = ?", [req.params.id]);
    if (!lote || lote.id !== req.user.lote_id) {
      return res.status(403).json({ error: "Ese lote no es tuyo" });
    }
    const ficha = await get("SELECT * FROM enfermedades WHERE id = ?", [
      req.body.id || "",
    ]);
    if (!ficha) return res.status(404).json({ error: "Esa ficha no está en el catálogo" });
    const src = path.join(catalogoDir(), ficha.filename);
    if (!fs.existsSync(src)) {
      return res.status(404).json({ error: "Falta el archivo de la foto de catálogo" });
    }
    const filename = `${Date.now()}-prueba-${ficha.filename}`;
    const dest = path.join(UPLOADS, filename);
    fs.copyFileSync(src, dest);
    const packed = await compactarFoto(dest);
    const hallazgo = await diagnosticarFoto(ficha.cultivo, packed.path);
    const id = `f-${Date.now()}`;
    await run(
      `INSERT INTO fotos
        (id,lote_id,user_id,filename,cultivo,calidad_planta,enfermedad,confianza_enfermedad,maleza,confianza_maleza,tratamiento,created_at,tipo,causa,archivo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        lote.id,
        req.user.id,
        packed.filename,
        ficha.cultivo,
        hallazgo.calidadPlantaPct,
        hallazgo.enfermedad,
        hallazgo.confianzaEnfermedad,
        hallazgo.maleza,
        hallazgo.confianzaMaleza,
        hallazgo.tratamiento,
        new Date().toISOString(),
        hallazgo.tipo || null,
        hallazgo.causa || null,
        packed.buffer,
      ],
    );
    await persistirHallazgo(id, hallazgo);
    const nuevaCalidad =
      hallazgo.match === "ninguno"
        ? lote.calidad_export
        : Math.round(lote.calidad_export * 0.7 + hallazgo.calidadPlantaPct * 0.3);
    if (nuevaCalidad !== lote.calidad_export) {
      await run("UPDATE lotes SET calidad_export = ? WHERE id = ?", [
        nuevaCalidad,
        lote.id,
      ]);
    }
    await run("INSERT INTO bitacora VALUES (?,?,?,?,?,?,?,?)", [
      `b-${id}`,
      lote.id,
      new Date().toISOString().slice(0, 10),
      "inspeccion",
      `Prueba IA: ${hallazgo.enfermedad}`,
      `${hallazgo.causa || ""}. ${hallazgo.tratamiento}`,
      req.user.nombre,
      "agricultor",
    ]);
    res.json({
      id,
      url: `/uploads/${packed.filename}`,
      hallazgo,
      calidadExportPct: nuevaCalidad,
    });
  }),
);

app.get(
  "/api/acopio/ranking",
  auth,
  requireRole("acopio", "exportadora"),
  wrap(async (req, res) => {
    let lotes;
    if (req.user.role === "acopio") {
      lotes = await all("SELECT * FROM lotes WHERE acopio_id = ?", [req.user.acopio_id]);
    } else {
      lotes = await all("SELECT * FROM lotes");
    }
    const ranking = await Promise.all(
      lotes.map(async (lote) => {
        const fotos = await all(
          `SELECT calidad_planta FROM fotos WHERE lote_id = ?`,
          [lote.id],
        );
        const ia =
          fotos.length > 0
            ? Math.round(
                fotos.reduce((acc, f) => acc + f.calidad_planta, 0) / fotos.length,
              )
            : null;
        const inocuidad =
          lote.semaforo === "verde" ? 100 : lote.semaforo === "ambar" ? 55 : 30;
        const fotoScore = Math.min(fotos.length * 25, 100);
        const score = Math.round(
          lote.calidad_export * 0.35 +
            inocuidad * 0.25 +
            fotoScore * 0.2 +
            (ia ?? 60) * 0.2,
        );
        return {
          productorId: lote.productor_id,
          productor: lote.productor,
          loteId: lote.id,
          variedad: lote.variedad,
          semaforo: lote.semaforo,
          calidadExportPct: lote.calidad_export,
          fotos: fotos.length,
          iaPromedio: ia,
          score,
          seleccion: lote.seleccion || "pendiente",
          acopioId: lote.acopio_id,
        };
      }),
    );
    ranking.sort((a, b) => b.score - a.score);
    res.json(ranking.map((row, i) => ({ ...row, puesto: i + 1 })));
  }),
);

app.get(
  "/api/acopio/fotos",
  auth,
  requireRole("acopio", "exportadora"),
  wrap(async (req, res) => {
    const fotos =
      req.user.role === "acopio"
        ? await all(
            `SELECT ${fotoCampos("f")}, l.productor, l.variedad
             FROM fotos f JOIN lotes l ON l.id = f.lote_id
             WHERE l.acopio_id = ?
             ORDER BY f.created_at DESC`,
            [req.user.acopio_id],
          )
        : await all(
            `SELECT ${fotoCampos("f")}, l.productor, l.variedad
             FROM fotos f JOIN lotes l ON l.id = f.lote_id
             ORDER BY f.created_at DESC`,
          );
    res.json(
      fotos.map((f) => mapFoto(f, { productor: f.productor, variedad: f.variedad })),
    );
  }),
);

app.post(
  "/api/acopio/lotes/:id/seleccion",
  auth,
  requireRole("acopio"),
  wrap(async (req, res) => {
    const lote = await get("SELECT * FROM lotes WHERE id = ?", [req.params.id]);
    if (!lote || lote.acopio_id !== req.user.acopio_id) {
      return res.status(403).json({ error: "Ese lote no es de tu acopio" });
    }
    const seleccion = req.body.seleccion === "seleccionado" ? "seleccionado" : "rechazado";
    if (seleccion === "seleccionado" && lote.semaforo !== "verde") {
      return res.status(400).json({
        error: "Lote deficiente: el acopio ya no recibe carencia ni bloqueados. Recházalo.",
      });
    }
    await run("UPDATE lotes SET seleccion = ? WHERE id = ?", [seleccion, lote.id]);
    res.json({ ok: true, id: lote.id, seleccion });
  }),
);

app.get("/api/acopios", wrap(async (_req, res) => {
  res.json(await all("SELECT * FROM acopios ORDER BY nombre"));
}));

app.get(
  "/api/exportadora/acopios",
  auth,
  requireRole("exportadora"),
  wrap(async (_req, res) => {
    const acopios = await all("SELECT * FROM acopios ORDER BY nombre");
    const out = await Promise.all(
      acopios.map(async (acopio) => {
        const lotes = await all("SELECT * FROM lotes WHERE acopio_id = ?", [acopio.id]);
        const seleccionados = lotes.filter((l) => l.seleccion === "seleccionado");
        const calidad =
          seleccionados.length === 0
            ? 0
            : Math.round(
                seleccionados.reduce((acc, l) => acc + l.calidad_export, 0) /
                  seleccionados.length,
              );
        return {
          id: acopio.id,
          nombre: acopio.nombre,
          zona: acopio.zona,
          productores: lotes.length,
          seleccionados: seleccionados.length,
          rechazados: lotes.filter((l) => l.seleccion === "rechazado").length,
          pendientes: lotes.filter((l) => (l.seleccion || "pendiente") === "pendiente").length,
          calidadPromedio: calidad,
        };
      }),
    );
    res.json(out);
  }),
);

app.get(
  "/api/exportadora/acopios/:id",
  auth,
  requireRole("exportadora"),
  wrap(async (req, res) => {
    const acopio = await get("SELECT * FROM acopios WHERE id = ?", [req.params.id]);
    if (!acopio) return res.status(404).json({ error: "Acopio no existe" });
    const rows = await all(
      "SELECT * FROM lotes WHERE acopio_id = ? AND seleccion = 'seleccionado'",
      [acopio.id],
    );
    res.json({
      acopio,
      lotes: await Promise.all(rows.map(lotePublico)),
    });
  }),
);

app.get(
  "/api/market/productos",
  wrap(async (req, res) => {
    const dni = String(req.query.dni || "").replace(/\D/g, "");
    let socio = false;
    if (dni.length === 8) {
      socio = Boolean(await get("SELECT id FROM socios WHERE dni = ?", [dni]));
    } else if (req.headers.authorization) {
      try {
        const header = req.headers.authorization || "";
        const raw = header.replace("Bearer ", "");
        const session = await get("SELECT * FROM sessions WHERE token = ?", [raw]);
        const user = session
          ? await get("SELECT * FROM users WHERE id = ?", [session.user_id])
          : null;
        if (user?.dni) {
          socio = Boolean(await get("SELECT id FROM socios WHERE dni = ?", [user.dni]));
        }
      } catch {
        socio = false;
      }
    }
    res.json({ socio, productos: await listarProductos(socio) });
  }),
);

app.post(
  "/api/market/verificar-dni",
  wrap(async (req, res) => {
    const dni = String(req.body.dni || "").replace(/\D/g, "");
    if (dni.length !== 8) {
      return res.status(400).json({ error: "El DNI debe tener 8 dígitos" });
    }
    const socio = await get("SELECT * FROM socios WHERE dni = ?", [dni]);
    if (!socio) {
      return res.json({ socio: false, dni });
    }
    const acopio = await get("SELECT * FROM acopios WHERE id = ?", [socio.acopio_id]);
    res.json({
      socio: true,
      dni,
      nombre: socio.nombre,
      acopioId: socio.acopio_id,
      acopioNombre: acopio?.nombre,
    });
  }),
);

app.post(
  "/api/market/socio",
  wrap(async (req, res) => {
    const dni = String(req.body.dni || "").replace(/\D/g, "");
    const nombre = String(req.body.nombre || "").trim();
    const acopioId = String(req.body.acopioId || "");
    if (dni.length !== 8) {
      return res.status(400).json({ error: "El DNI debe tener 8 dígitos" });
    }
    if (!nombre) return res.status(400).json({ error: "Falta el nombre" });
    const acopio = await get("SELECT * FROM acopios WHERE id = ?", [acopioId]);
    if (!acopio) return res.status(400).json({ error: "Elige un acopio" });
    const ya = await get("SELECT * FROM socios WHERE dni = ?", [dni]);
    if (ya) {
      return res.json({
        socio: true,
        dni,
        nombre: ya.nombre,
        acopioNombre: acopio.nombre,
      });
    }
    await run("INSERT INTO socios VALUES (?,?,?,?,?,?)", [
      `soc-${dni}`,
      dni,
      nombre,
      acopio.id,
      null,
      new Date().toISOString(),
    ]);
    res.json({
      socio: true,
      dni,
      nombre,
      acopioId: acopio.id,
      acopioNombre: acopio.nombre,
    });
  }),
);

app.get(
  "/api/clima",
  wrap(async (_req, res) => {
    res.json(await climaTingo());
  }),
);

if (process.env.NODE_ENV === "production") {
  const dist = path.join(ROOT, "dist");
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Error interno" });
});

await initSchema();
try {
  const h = await hidratarArchivos(UPLOADS);
  if (h.restored || h.saved) {
    console.log(`Fotos de lote: ${h.restored} restauradas del disco persistente, ${h.saved} guardadas`);
  }
  const r = await reanalizarPendientes(UPLOADS);
  const n = await refrescarRespuestasCatalogo();
  if (r.actualizadas.length || n) {
    console.log(
      `IA catálogo: ${r.actualizadas.length} fotos sin match ahora coinciden, ${n} respuestas actualizadas`,
    );
  }
} catch (err) {
  console.error("No se pudieron actualizar fotos de lote con el catálogo:", err.message);
}
const server = app.listen(PORT, "0.0.0.0", () => {
  const db = process.env.DATABASE_URL
    ? "DATABASE_URL"
    : `${process.env.PGDATABASE || "AgroTrace360"}:${process.env.PGPORT || 5433}`;
  console.log(`AgroTrace API (${db}) en http://localhost:${PORT}`);
});
server.on("error", (err) => {
  console.error("API no pudo escuchar:", err.message);
  process.exit(1);
});
