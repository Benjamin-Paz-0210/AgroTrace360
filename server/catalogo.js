import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { all, get, run } from "./db.js";
import { extraerHuella } from "./vision.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOGO_DIR = path.join(__dirname, "..", "data", "uploads", "catalogo");

export const ENFERMEDADES = [
  {
    id: "cac-monilia",
    cultivo: "cacao",
    tipo: "enfermedad",
    nombre: "Moniliasis (mazorca helada)",
    nombreCientifico: "Moniliophthora roreri",
    causa:
      "Hongo Moniliophthora roreri. Esporas en mazorca, humedad alta y poca aireación del dosel.",
    sintoma: "Mazorca con polvo blanco-crema, deformada; luego se momifica.",
    tratamiento:
      "Recolectar y enterrar mazorcas enfermas. Cobre 50 g/mochila 20 L. Un solo activo. Podar para airear.",
    aviso: "Si no se controla en 10 días, el foco se mueve al resto del acopio.",
    calidadPlanta: 68,
    filename: "cacao-monilia.jpg",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/Theobroma_cacao_003.JPG",
    ],
  },
  {
    id: "cac-phyt",
    cultivo: "cacao",
    tipo: "enfermedad",
    nombre: "Mazorca negra",
    nombreCientifico: "Phytophthora palmivora",
    causa:
      "Hongo del suelo y del agua. Encharcamiento, heridas en el fruto y salpique de lluvia.",
    sintoma: "Mancha oscura que cubre la mazorca; pulpa podrida.",
    tratamiento:
      "Mejorar drenaje y sombra. Cobre de catálogo. No mezclar activos. Retirar frutos enfermos.",
    aviso: "El encharcamiento dispara el foco. El lote en carencia no entra al contenedor.",
    calidadPlanta: 74,
    filename: "cacao-mazorca-negra.jpg",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/8/88/Cocoa_Pods.JPG",
    ],
  },
  {
    id: "cac-sano",
    cultivo: "cacao",
    tipo: "sano",
    nombre: "Mazorca sana",
    nombreCientifico: "Theobroma cacao",
    causa: "No aplica: no hay patógeno ni plaga dominante en la foto.",
    sintoma: "Color uniforme, sin polvo, sin necrosis ni insecto en corona.",
    tratamiento:
      "Mantener plateo ligero y potasio de llenado. No aplicar químico por si acaso.",
    aviso: "Calidad alta. Esta foto sube el ranking del productor en acopio.",
    calidadPlanta: 91,
    filename: "cacao-sano.jpg",
    urls: [
      "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    id: "cac-cyperus",
    cultivo: "cacao",
    tipo: "plaga",
    nombre: "Coquito en corona",
    nombreCientifico: "Cyperus rotundus",
    causa:
      "Maleza perenne que compite por luz y agua en la corona, sobre todo días 0–45 post-poda.",
    sintoma: "Macolla de coquito pegada al tallo; plantón sombreado.",
    tratamiento: "Plateo mecánico. No herbicida sobre plantón ni fruto.",
    aviso: "Sin control en esa ventana se puede perder hasta el 70% del rendimiento.",
    calidadPlanta: 62,
    filename: "cacao-maleza-cyperus.jpg",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cyperus_rotundus_Blanco2.238.png",
    ],
  },
  {
    id: "mz-cogollero",
    cultivo: "maiz",
    tipo: "plaga",
    nombre: "Gusano cogollero",
    nombreCientifico: "Spodoptera frugiperda",
    causa:
      "Larva que entra al cartucho. Favorecida por siembra desfasada y gramíneas en el surco.",
    sintoma: "Hojas del cogollo perforadas, aserrín húmedo y larva en el cartucho.",
    tratamiento:
      "Bacillus thuringiensis 30 ml/mochila 20 L. Deshierbe ahora. Un solo activo. Carencia 3 días.",
    aviso: "El acopio bloquea si hay mezcla de insecticidas.",
    calidadPlanta: 64,
    filename: "maiz-cogollero.jpg",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/95/Spodoptera_frugiperda_larva.jpg",
    ],
  },
  {
    id: "cf-roya",
    cultivo: "cafe",
    tipo: "enfermedad",
    nombre: "Roya del cafeto",
    nombreCientifico: "Hemileia vastatrix",
    causa:
      "Hongo Hemileia vastatrix. Humedad en el envés y sombra mal manejada.",
    sintoma: "Polvo naranja en el envés; la hoja se seca y cae.",
    tratamiento:
      "Regular sombra, recojo de hojas y cobre preventivo solo si el acopio lo autoriza.",
    aviso: "Sin foto el lote queda ciego para el técnico.",
    calidadPlanta: 70,
    filename: "cafe-roya.jpg",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1c/Coffea_arabica_leaves.jpg",
    ],
  },
  {
    id: "pl-sigatoka",
    cultivo: "platano",
    tipo: "enfermedad",
    nombre: "Sigatoka",
    nombreCientifico: "Pseudocercospora fijiensis",
    causa: "Hongo foliar. Lluvia frecuente y poca circulación de aire entre plantas.",
    sintoma: "Rayas negras en la hoja que se unen y secan el limbo.",
    tratamiento: "Deshoje sanitario. Evitar mezclas. Potasio según plan.",
    aviso: "La foto queda para que el acopio audite el manejo.",
    calidadPlanta: 72,
    filename: "platano-sigatoka.jpg",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/9d/Musa_acuminata.jpg",
    ],
  },
];

const UA = "AgroTrace360/0.1 (Hackaton FIIS UNAS; agrotrace360@local)";

async function descargar(urls, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
    return fs.readFileSync(dest);
  }
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "image/*" } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1500) continue;
      fs.writeFileSync(dest, buf);
      return buf;
    } catch {
      continue;
    }
  }
  throw new Error(`No se pudo bajar foto para ${path.basename(dest)}`);
}

function checksum(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function seedEnfermedades() {
  fs.mkdirSync(CATALOGO_DIR, { recursive: true });
  for (const item of ENFERMEDADES) {
    const dest = path.join(CATALOGO_DIR, item.filename);
    const buf = await descargar(item.urls, dest);
    const sum = checksum(buf);
    const huella = JSON.stringify(await extraerHuella(dest));
    const row = await get("SELECT id FROM enfermedades WHERE id = ?", [item.id]);
    const valores = [
      item.cultivo,
      item.tipo,
      item.nombre,
      item.nombreCientifico,
      item.causa,
      item.sintoma,
      item.tratamiento,
      item.aviso,
      item.calidadPlanta,
      item.filename,
      sum,
      buf.length,
      huella,
      item.id,
    ];
    if (row) {
      await run(
        `UPDATE enfermedades SET
          cultivo=?, tipo=?, nombre=?, nombre_cientifico=?, causa=?, sintoma=?,
          tratamiento=?, aviso=?, calidad_planta=?, filename=?, checksum=?, bytes=?, huella=?
         WHERE id=?`,
        valores,
      );
    } else {
      await run(
        `INSERT INTO enfermedades
          (cultivo,tipo,nombre,nombre_cientifico,causa,sintoma,tratamiento,aviso,calidad_planta,filename,checksum,bytes,huella,id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        valores,
      );
    }
  }
  const n = await get("SELECT COUNT(*)::int AS n FROM enfermedades");
  console.log(`Catálogo enfermedad/plaga: ${n?.n ?? 0} fotos con huella visual`);
}

export async function listarEnfermedades(cultivo, tipo) {
  const filtroCultivo =
    typeof cultivo === "string" && cultivo.trim() ? cultivo.trim().toLowerCase() : "";
  const filtroTipo =
    typeof tipo === "string" && tipo.trim() ? tipo.trim().toLowerCase() : "";
  let sql = "SELECT * FROM enfermedades WHERE 1=1";
  const params = [];
  if (filtroCultivo) {
    sql += " AND cultivo = ?";
    params.push(filtroCultivo);
  }
  if (filtroTipo) {
    sql += " AND tipo = ?";
    params.push(filtroTipo);
  }
  sql += " ORDER BY tipo, cultivo, nombre";
  const rows = await all(sql, params);
  return rows.map((row) => ({
    id: row.id,
    cultivo: row.cultivo,
    tipo: row.tipo,
    nombre: row.nombre,
    nombreCientifico: row.nombre_cientifico,
    causa: row.causa,
    sintoma: row.sintoma,
    tratamiento: row.tratamiento,
    aviso: row.aviso,
    calidadPlanta: row.calidad_planta,
    filename: row.filename,
    url: `/uploads/catalogo/${row.filename}`,
  }));
}

export function catalogoDir() {
  return CATALOGO_DIR;
}
