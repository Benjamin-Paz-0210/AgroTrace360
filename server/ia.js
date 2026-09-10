import crypto from "crypto";
import fs from "fs";
import path from "path";
import { extraerHuella, similitud } from "./vision.js";
import { all, get } from "./db.js";
import { catalogoDir } from "./catalogo.js";

const UMBRAL = 0.82;

function parseHuella(row) {
  if (!row?.huella) return null;
  try {
    return typeof row.huella === "string" ? JSON.parse(row.huella) : row.huella;
  } catch {
    return null;
  }
}

async function huellaFila(row) {
  const guardada = parseHuella(row);
  if (guardada?.grid?.length) return guardada;
  const archivo = path.join(catalogoDir(), row.filename);
  if (!fs.existsSync(archivo)) return null;
  return extraerHuella(archivo);
}

function toHallazgo(row, confianza, match, similitudPct) {
  const esPlaga = row.tipo === "plaga";
  return {
    id: row.id,
    cultivo: row.cultivo,
    tipo: row.tipo,
    calidadPlantaPct: row.calidad_planta,
    enfermedad: row.nombre,
    confianzaEnfermedad: confianza,
    maleza: esPlaga ? row.nombre : "Sin plaga dominante en esta foto",
    confianzaMaleza: esPlaga ? confianza : 0,
    causa: row.causa,
    tratamiento: row.tratamiento,
    aviso: row.aviso,
    nombreCientifico: row.nombre_cientifico,
    match,
    similitud: similitudPct,
    fotoCatalogo: `/uploads/catalogo/${row.filename}`,
  };
}

function sinCoincidencia(cultivo) {
  return {
    id: "sin-match",
    cultivo,
    tipo: "sin_match",
    calidadPlantaPct: 0,
    enfermedad: "Sin coincidencia en el catálogo",
    confianzaEnfermedad: 0,
    maleza: "Sin coincidencia",
    confianzaMaleza: 0,
    causa: "La foto no se parece a ninguna ficha etiquetada (enfermedad o plaga).",
    tratamiento:
      "Vuelve a tomar la foto de cerca (hoja, mazorca o insecto) o agrega esa imagen al catálogo con su causa y tratamiento.",
    aviso: "No se inventa un diagnóstico. Solo se compara contra las fotos de la base.",
    match: "ninguno",
    similitud: 0,
    fotoCatalogo: null,
  };
}

export async function diagnosticarFoto(cultivo, filePath) {
  const sum = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  const exacto = await get("SELECT * FROM enfermedades WHERE checksum = ?", [sum]);
  if (exacto) {
    return toHallazgo(exacto, 99, "exacto", 100);
  }

  const consulta = await extraerHuella(filePath);
  const mismoCultivo = await all("SELECT * FROM enfermedades WHERE cultivo = ?", [
    cultivo || "cacao",
  ]);
  const lista = mismoCultivo.length
    ? mismoCultivo
    : await all("SELECT * FROM enfermedades");
  if (!lista.length) {
    return sinCoincidencia(cultivo);
  }

  let mejor = null;
  for (const row of lista) {
    const ref = await huellaFila(row);
    if (!ref) continue;
    const score = similitud(consulta, ref);
    if (!mejor || score > mejor.score) mejor = { row, score };
  }

  if (!mejor || mejor.score < UMBRAL) {
    return sinCoincidencia(cultivo);
  }

  const pct = Math.round(mejor.score * 100);
  const confianza = Math.min(97, Math.max(70, pct - 3));
  return toHallazgo(mejor.row, confianza, "visual", pct);
}
