import fs from "fs";
import path from "path";
import { all, get, run } from "./db.js";
import { diagnosticarFoto } from "./ia.js";

export function esSinMatch(foto) {
  const match = String(foto?.match || "");
  const tipo = String(foto?.tipo || "");
  const nombre = String(foto?.enfermedad || "");
  return match === "ninguno" || tipo === "sin_match" || /sin coincidencia/i.test(nombre);
}

function catalogoFile(hallazgo) {
  if (!hallazgo?.fotoCatalogo) return null;
  return path.basename(String(hallazgo.fotoCatalogo));
}

export async function persistirHallazgo(fotoId, hallazgo) {
  await run(
    `UPDATE fotos SET
      calidad_planta=?, enfermedad=?, confianza_enfermedad=?, maleza=?, confianza_maleza=?,
      tratamiento=?, tipo=?, causa=?, match=?, similitud=?, aviso=?, catalogo_filename=?, nombre_cientifico=?
     WHERE id=?`,
    [
      hallazgo.calidadPlantaPct,
      hallazgo.enfermedad,
      hallazgo.confianzaEnfermedad,
      hallazgo.maleza,
      hallazgo.confianzaMaleza,
      hallazgo.tratamiento,
      hallazgo.tipo || null,
      hallazgo.causa || null,
      hallazgo.match || null,
      hallazgo.similitud ?? 0,
      hallazgo.aviso || null,
      catalogoFile(hallazgo),
      hallazgo.nombreCientifico || null,
      fotoId,
    ],
  );
}

function archivoFoto(uploadsDir, filename) {
  if (!filename) return null;
  const archivo = path.join(uploadsDir, path.basename(String(filename)));
  if (!archivo.startsWith(uploadsDir) || !fs.existsSync(archivo)) return null;
  return archivo;
}

export async function reanalizarFoto(foto, uploadsDir) {
  const archivo = archivoFoto(uploadsDir, foto.filename);
  if (!archivo) return { cambio: false, hallazgo: null };
  const hallazgo = await diagnosticarFoto(foto.cultivo || "cacao", archivo);
  const ahoraMatch = hallazgo.match !== "ninguno";
  const antesPendiente = esSinMatch(foto);
  const cambio =
    hallazgo.enfermedad !== foto.enfermedad ||
    String(hallazgo.match || "") !== String(foto.match || "") ||
    (antesPendiente && ahoraMatch);
  if (cambio) await persistirHallazgo(foto.id, hallazgo);
  return { cambio, hallazgo };
}

export async function reanalizarPendientes(uploadsDir, loteId) {
  const rows = loteId
    ? await all("SELECT * FROM fotos WHERE lote_id = ?", [loteId])
    : await all("SELECT * FROM fotos");
  const pendientes = rows.filter(esSinMatch);
  const actualizadas = [];
  for (const foto of pendientes) {
    const r = await reanalizarFoto(foto, uploadsDir);
    if (r.cambio && r.hallazgo && r.hallazgo.match !== "ninguno") {
      actualizadas.push({ id: foto.id, hallazgo: r.hallazgo });
    }
  }
  return { pendientes: pendientes.length, actualizadas };
}

export async function refrescarRespuestasCatalogo(loteId) {
  const rows = loteId
    ? await all(
        "SELECT * FROM fotos WHERE lote_id = ? AND catalogo_filename IS NOT NULL",
        [loteId],
      )
    : await all("SELECT * FROM fotos WHERE catalogo_filename IS NOT NULL");
  let n = 0;
  for (const foto of rows) {
    const ficha = await get("SELECT * FROM enfermedades WHERE filename = ?", [
      foto.catalogo_filename,
    ]);
    if (!ficha) continue;
    if (
      ficha.tratamiento === foto.tratamiento &&
      ficha.causa === foto.causa &&
      ficha.aviso === foto.aviso &&
      ficha.nombre === foto.enfermedad
    ) {
      continue;
    }
    await run(
      `UPDATE fotos SET tratamiento=?, causa=?, aviso=?, nombre_cientifico=?, enfermedad=? WHERE id=?`,
      [
        ficha.tratamiento,
        ficha.causa,
        ficha.aviso,
        ficha.nombre_cientifico,
        ficha.nombre,
        foto.id,
      ],
    );
    n += 1;
  }
  return n;
}
