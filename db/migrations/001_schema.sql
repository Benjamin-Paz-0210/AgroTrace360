-- AgroTrace 360 · esquema inicial (Postgres / Supabase)
-- Idempotente: se puede correr más de una vez.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  nombre TEXT,
  role TEXT,
  lote_id TEXT,
  comunidad TEXT,
  dni TEXT,
  acopio_id TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS lotes (
  id TEXT PRIMARY KEY,
  productor_id TEXT,
  productor TEXT,
  parcela TEXT,
  cultivo TEXT,
  variedad TEXT,
  sistema TEXT,
  plantas_ha INTEGER,
  area_ha DOUBLE PRECISION,
  fecha_poda TEXT,
  semaforo TEXT,
  dias_carencia INTEGER,
  calidad_export INTEGER,
  pasos_json TEXT,
  ruta_json TEXT,
  acopio_id TEXT,
  seleccion TEXT
);

CREATE TABLE IF NOT EXISTS bitacora (
  id TEXT PRIMARY KEY,
  lote_id TEXT,
  fecha TEXT,
  tipo TEXT,
  titulo TEXT,
  nota TEXT,
  autor TEXT,
  rol TEXT
);

CREATE TABLE IF NOT EXISTS fotos (
  id TEXT PRIMARY KEY,
  lote_id TEXT,
  user_id TEXT,
  filename TEXT,
  cultivo TEXT,
  calidad_planta INTEGER,
  enfermedad TEXT,
  confianza_enfermedad INTEGER,
  maleza TEXT,
  confianza_maleza INTEGER,
  tratamiento TEXT,
  created_at TEXT,
  tipo TEXT,
  causa TEXT,
  match TEXT,
  similitud INTEGER,
  aviso TEXT,
  catalogo_filename TEXT,
  nombre_cientifico TEXT
);

CREATE TABLE IF NOT EXISTS enfermedades (
  id TEXT PRIMARY KEY,
  cultivo TEXT,
  tipo TEXT,
  nombre TEXT,
  nombre_cientifico TEXT,
  maleza TEXT,
  sintoma TEXT,
  tratamiento TEXT,
  aviso TEXT,
  calidad_planta INTEGER,
  confianza INTEGER,
  filename TEXT,
  checksum TEXT,
  bytes INTEGER,
  causa TEXT,
  huella TEXT
);

CREATE TABLE IF NOT EXISTS acopios (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  zona TEXT,
  exportadora_id TEXT
);

CREATE TABLE IF NOT EXISTS socios (
  id TEXT PRIMARY KEY,
  dni TEXT UNIQUE,
  nombre TEXT,
  acopio_id TEXT,
  user_id TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS market_productos (
  id TEXT PRIMARY KEY,
  categoria TEXT,
  nombre TEXT,
  unidad TEXT,
  precio DOUBLE PRECISION,
  precio_socio DOUBLE PRECISION,
  imagen TEXT,
  descripcion TEXT
);
