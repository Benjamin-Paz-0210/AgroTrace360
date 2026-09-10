import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { Pool } = pg;
const ROOT = path.join(__dirname, "..");

function needsSsl(url) {
  if (process.env.PGSSL === "true" || process.env.PGSSLMODE === "require") return true;
  return Boolean(url && /supabase\.com|render\.com|amazonaws\.com/i.test(url));
}

function makePool() {
  const url = process.env.DATABASE_URL;
  const ssl = needsSsl(url) ? { rejectUnauthorized: false } : undefined;
  if (url) {
    return new Pool({ connectionString: url, ssl, max: 8 });
  }
  return new Pool({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5433),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || "AgroTrace360",
    ssl,
    max: 8,
  });
}

export const pool = makePool();

function numbered(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export async function all(sql, params = []) {
  const { rows } = await pool.query(numbered(sql), params);
  return rows;
}

export async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0];
}

export async function run(sql, params = []) {
  await pool.query(numbered(sql), params);
}

function hash(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function applySchema() {
  const sql = fs.readFileSync(path.join(ROOT, "db", "migrations", "001_schema.sql"), "utf8");
  await pool.query(sql);
}

export async function initSchema() {
  await applySchema();
  await pool.query(`
    ALTER TABLE enfermedades ADD COLUMN IF NOT EXISTS causa TEXT;
    ALTER TABLE enfermedades ADD COLUMN IF NOT EXISTS huella TEXT;
    ALTER TABLE fotos ADD COLUMN IF NOT EXISTS tipo TEXT;
    ALTER TABLE fotos ADD COLUMN IF NOT EXISTS causa TEXT;
    ALTER TABLE fotos ADD COLUMN IF NOT EXISTS match TEXT;
    ALTER TABLE fotos ADD COLUMN IF NOT EXISTS similitud INTEGER;
    ALTER TABLE fotos ADD COLUMN IF NOT EXISTS aviso TEXT;
    ALTER TABLE fotos ADD COLUMN IF NOT EXISTS catalogo_filename TEXT;
    ALTER TABLE fotos ADD COLUMN IF NOT EXISTS nombre_cientifico TEXT;
    ALTER TABLE fotos ADD COLUMN IF NOT EXISTS archivo BYTEA;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS dni TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS acopio_id TEXT;
    ALTER TABLE lotes ADD COLUMN IF NOT EXISTS acopio_id TEXT;
    ALTER TABLE lotes ADD COLUMN IF NOT EXISTS seleccion TEXT;
  `);

  const existing = await get("SELECT id FROM users LIMIT 1");
  if (!existing) {
  const pass = hash("demo123");
  const users = [
    ["prod-jose", "jose@agrotrace.pe", pass, "José Huamán Quispe", "agricultor", "LOT-TM-001", "Tingo María · 670 msnm"],
    ["prod-elena", "elena@agrotrace.pe", pass, "Elena Ríos Pinedo", "agricultor", "LOT-TM-002", "Aucayacu"],
    ["prod-pedro", "pedro@agrotrace.pe", pass, "Pedro Vásquez Tello", "agricultor", "LOT-TM-003", "Castillo Grande"],
    ["acopio-maria", "maria@agrotrace.pe", pass, "María Pérez (acopio)", "acopio", null, "Cooperativa Alto Huallaga"],
    ["exp-claudia", "export@agrotrace.pe", pass, "Claudia Ramos (exportadora)", "exportadora", null, "Exportadora Huánuco Selva Central"],
  ];
  for (const u of users) {
    await run(
      "INSERT INTO users (id,email,password_hash,nombre,role,lote_id,comunidad) VALUES (?,?,?,?,?,?,?)",
      u,
    );
  }

  const lotes = [
    ["LOT-TM-001", "prod-jose", "José Huamán Quispe", "Caserío Tingo María, 1.5 ha", "cacao", "CCN-51", "tresbolillo 3×3 m", 1283, 1.5, "2026-03-15", "verde", 0, 92],
    ["LOT-TM-002", "prod-elena", "Elena Ríos Pinedo", "Aucayacu, 2.2 ha", "cacao", "VRAE-99", "cuadrado 3×3 m", 1111, 2.2, "2026-04-01", "ambar", 9, 71],
    ["LOT-TM-003", "prod-pedro", "Pedro Vásquez Tello", "Castillo Grande, 0.8 ha", "cacao", "Nativo fino de aroma", "tresbolillo 3×3 m", 1283, 0.8, "2026-02-20", "verde", 0, 88],
  ];
  const pasosJose = JSON.stringify([
    { id: "semilla", label: "Semilla y clon", status: "hecho", detail: "CCN-51 de vivero certificado SENASA / INIA" },
    { id: "densidad", label: "Densidad y trazo", status: "hecho", detail: "1 283 pl/ha · surcos N-S" },
    { id: "nutricion", label: "Nutrición por etapa", status: "en_curso", detail: "Llenado: potasio y calcio" },
    { id: "malezas", label: "Ventana de malezas", status: "hecho", detail: "Plateo en días 0–45 post-poda" },
    { id: "fitosanitario", label: "Fitosanitario", status: "hecho", detail: "Cobre · un solo activo · carencia cumplida" },
    { id: "cosecha", label: "Cosecha y salida", status: "pendiente", detail: "Semáforo verde: el acopio puede emitir salida" },
  ]);
  const pasosElena = JSON.stringify([
    { id: "semilla", label: "Semilla y clon", status: "hecho", detail: "VRAE-99" },
    { id: "densidad", label: "Densidad y trazo", status: "hecho", detail: "1 111 pl/ha" },
    { id: "nutricion", label: "Nutrición por etapa", status: "hecho", detail: "Calendario al día" },
    { id: "malezas", label: "Ventana de malezas", status: "hecho", detail: "Control mecánico" },
    { id: "fitosanitario", label: "Fitosanitario", status: "hecho", detail: "Aplicación del 1 sep · carencia 14 días" },
    { id: "cosecha", label: "Cosecha y salida", status: "bloqueado", detail: "Bloqueado: faltan 9 días de carencia" },
  ]);
  const pasosPedro = JSON.stringify([
    { id: "semilla", label: "Semilla y clon", status: "hecho", detail: "Nativo fino de aroma" },
    { id: "densidad", label: "Densidad y trazo", status: "hecho", detail: "1 283 pl/ha" },
    { id: "nutricion", label: "Nutrición por etapa", status: "hecho", detail: "Plan de 17 nutrientes" },
    { id: "malezas", label: "Ventana de malezas", status: "hecho", detail: "Ventana cerrada a tiempo" },
    { id: "fitosanitario", label: "Fitosanitario", status: "hecho", detail: "Sin aplicaciones en carencia" },
    { id: "cosecha", label: "Cosecha y salida", status: "en_curso", detail: "Listo para acopio de aroma fino" },
  ]);
  const ruta = (origen, lat, lng) =>
    JSON.stringify([
      { id: "n1", nombre: origen, tipo: "parcela", coords: [lat, lng], fecha: "2026-03-15", estado: "completado" },
      { id: "n2", nombre: "Acopio Alto Huallaga", tipo: "acopio", coords: [-9.3, -76], fecha: "2026-09-24", estado: "programado" },
      { id: "n3", nombre: "Puerto del Callao", tipo: "puerto", coords: [-12.054, -77.151], fecha: "2026-10-02", estado: "programado" },
      { id: "n4", nombre: "Rotterdam, UE", tipo: "destino", coords: [51.9225, 4.47917], fecha: "2026-10-28", estado: "programado" },
    ]);

  await run(
    "INSERT INTO lotes (id,productor_id,productor,parcela,cultivo,variedad,sistema,plantas_ha,area_ha,fecha_poda,semaforo,dias_carencia,calidad_export,pasos_json,ruta_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [...lotes[0], pasosJose, ruta("Parcela Tingo María", -9.295, -76)],
  );
  await run(
    "INSERT INTO lotes (id,productor_id,productor,parcela,cultivo,variedad,sistema,plantas_ha,area_ha,fecha_poda,semaforo,dias_carencia,calidad_export,pasos_json,ruta_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [...lotes[1], pasosElena, ruta("Parcela Aucayacu", -8.89, -76.13)],
  );
  await run(
    "INSERT INTO lotes (id,productor_id,productor,parcela,cultivo,variedad,sistema,plantas_ha,area_ha,fecha_poda,semaforo,dias_carencia,calidad_export,pasos_json,ruta_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [...lotes[2], pasosPedro, ruta("Castillo Grande", -9.21, -76.03)],
  );

  const notes = [
    ["b1", "LOT-TM-001", "2026-03-15", "siembra", "Poda y registro del clon CCN-51", "Vivero certificado SENASA/INIA.", "José Huamán", "agricultor"],
    ["b2", "LOT-TM-001", "2026-03-16", "densidad", "Marco tresbolillo 3×3", "1 283 plantas/ha. Surcos norte-sur.", "María Pérez", "acopio"],
    ["b3", "LOT-TM-001", "2026-04-02", "malezas", "Plateo en ventana crítica", "Deshierbe de corona. Sin herbicida sobre plantón.", "José Huamán", "agricultor"],
    ["b4", "LOT-TM-001", "2026-06-10", "nutricion", "Abono de floración", "Boro, zinc y calcio. No se siguió solo con nitrógeno.", "José Huamán", "agricultor"],
    ["b5", "LOT-TM-001", "2026-07-12", "fitosanitario", "Cobre contra monilia", "50 g/mochila 20 L. Un solo activo. Carencia cumplida.", "José Huamán", "agricultor"],
    ["b6", "LOT-TM-001", "2026-09-08", "inspeccion", "Inspección de acopio", "Lote apto. Calidad preliminar 92% para exportación UE.", "María Pérez", "acopio"],
    ["e1", "LOT-TM-002", "2026-04-01", "siembra", "Alta de parcela VRAE-99", "Material de vivero local.", "Elena Ríos", "agricultor"],
    ["e2", "LOT-TM-002", "2026-09-01", "fitosanitario", "Tratamiento en carencia", "Cosecha bloqueada 14 días. Este lote no entra al contenedor.", "Elena Ríos", "agricultor"],
    ["p1", "LOT-TM-003", "2026-02-20", "siembra", "Registro de nativo fino", "Lote diferenciado para mercado de aroma.", "Pedro Vásquez", "agricultor"],
    ["p2", "LOT-TM-003", "2026-08-20", "acopio", "Muestra de aroma fino", "88% apto export.", "María Pérez", "acopio"],
  ];
  for (const row of notes) {
    await run("INSERT INTO bitacora (id,lote_id,fecha,tipo,titulo,nota,autor,rol) VALUES (?,?,?,?,?,?,?,?)", row);
  }
  }

  const { seedEnfermedades } = await import("./catalogo.js");
  await seedEnfermedades();
  const { migrateOrg } = await import("./org.js");
  await migrateOrg();
}
