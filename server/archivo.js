import fs from "fs";
import path from "path";
import sharp from "sharp";
import { all, get, run } from "./db.js";

export const FOTO_CAMPOS =
  "id, lote_id, user_id, filename, cultivo, calidad_planta, enfermedad, confianza_enfermedad, maleza, confianza_maleza, tratamiento, created_at, tipo, causa, match, similitud, aviso, catalogo_filename, nombre_cientifico";

export function fotoCampos(alias = "") {
  const p = alias ? `${alias}.` : "";
  return FOTO_CAMPOS.split(", ")
    .map((c) => `${p}${c}`)
    .join(", ");
}

function asBuffer(value) {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  try {
    return Buffer.from(value);
  } catch {
    return null;
  }
}

export async function compactarFoto(filePath) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const dest = path.join(dir, `${base}.jpg`);
  const buffer = await sharp(filePath)
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(dest, buffer);
  if (dest !== filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { buffer, path: dest, filename: path.basename(dest) };
}

export async function guardarBytes(fotoId, buffer) {
  await run("UPDATE fotos SET archivo = ? WHERE id = ?", [buffer, fotoId]);
}

export async function leerBytes(filename) {
  const row = await get("SELECT archivo FROM fotos WHERE filename = ?", [
    path.basename(String(filename || "")),
  ]);
  return asBuffer(row?.archivo);
}

export function rutaSegura(uploadsDir, filename) {
  if (!filename) return null;
  const dest = path.join(uploadsDir, path.basename(String(filename)));
  if (!dest.startsWith(uploadsDir)) return null;
  return dest;
}

export async function asegurarEnDisco(uploadsDir, filename) {
  const dest = rutaSegura(uploadsDir, filename);
  if (!dest) return null;
  if (fs.existsSync(dest)) return dest;
  const buf = await leerBytes(filename);
  if (!buf) return null;
  fs.writeFileSync(dest, buf);
  return dest;
}

export async function hidratarArchivos(uploadsDir) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  const rows = await all("SELECT id, filename, archivo FROM fotos");
  let restored = 0;
  let saved = 0;
  for (const row of rows) {
    const dest = rutaSegura(uploadsDir, row.filename);
    if (!dest) continue;
    const buf = asBuffer(row.archivo);
    if (buf && !fs.existsSync(dest)) {
      fs.writeFileSync(dest, buf);
      restored += 1;
    } else if (!buf && fs.existsSync(dest)) {
      const packed = await compactarFoto(dest);
      if (packed.filename !== row.filename) {
        await run("UPDATE fotos SET filename = ?, archivo = ? WHERE id = ?", [
          packed.filename,
          packed.buffer,
          row.id,
        ]);
      } else {
        await guardarBytes(row.id, packed.buffer);
      }
      saved += 1;
    }
  }
  return { restored, saved };
}
