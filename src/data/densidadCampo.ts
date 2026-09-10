import type { CultivoId } from "./agronomiaCampo";

export type Marco = "rectangular" | "tresbolillo";

export type VariedadDensidad = {
  id: string;
  cultivo: CultivoId;
  nombre: string;
  marco: Marco;
  entreSurco: number;
  entrePlanta: number;
  nota: string;
};

export type ZonaDensidad = {
  id: string;
  nombre: string;
  factor: number;
  nota: string;
};

export const VARIEDADES: VariedadDensidad[] = [
  {
    id: "ccn51",
    cultivo: "cacao",
    nombre: "CCN-51 certificado",
    marco: "tresbolillo",
    entreSurco: 3,
    entrePlanta: 3,
    nota: "Clon productivo. 3×3 en tresbolillo ≈ 1 283 pl/ha. Más junto = monilia y competencia.",
  },
  {
    id: "vrae99",
    cultivo: "cacao",
    nombre: "VRAE-99 certificado",
    marco: "tresbolillo",
    entreSurco: 3,
    entrePlanta: 3,
    nota: "Mismo marco que CCN-51 en selva alta. No apretar: aroma y sanidad.",
  },
  {
    id: "nativo",
    cultivo: "cacao",
    nombre: "Nativo fino de aroma",
    marco: "tresbolillo",
    entreSurco: 3.5,
    entrePlanta: 3.5,
    nota: "Árbol más amplio. 3,5×3,5 ≈ 943 pl/ha. A 3×3 se tapa y baja calidad de baba.",
  },
  {
    id: "inia-hibrido",
    cultivo: "maiz",
    nombre: "Híbrido INIA amarillo duro",
    marco: "rectangular",
    entreSurco: 0.8,
    entrePlanta: 0.25,
    nota: "Charla de campo: 50 mil pl/ha (0,80 × 0,25). Puede 55 mil si el suelo está apto.",
  },
  {
    id: "criollo",
    cultivo: "maiz",
    nombre: "Criollo / semilla de cosecha",
    marco: "rectangular",
    entreSurco: 0.9,
    entrePlanta: 0.4,
    nota: "No rinde como el híbrido. 0,90 × 0,40 ≈ 27 800 pl/ha. Ahí el problema 1 se junta con el 2.",
  },
  {
    id: "catimor",
    cultivo: "cafe",
    nombre: "Catimor / resistente a roya",
    marco: "rectangular",
    entreSurco: 2,
    entrePlanta: 1,
    nota: "2×1 m = 5 000 pl/ha. Más denso pide más sombra y más cobre.",
  },
  {
    id: "typica",
    cultivo: "cafe",
    nombre: "Típica / caturra",
    marco: "rectangular",
    entreSurco: 2,
    entrePlanta: 1.2,
    nota: "Un poco más abierto: 4 167 pl/ha. Mejor aire contra roya.",
  },
  {
    id: "bellaco",
    cultivo: "platano",
    nombre: "Bellaco / injerto certificado",
    marco: "rectangular",
    entreSurco: 3,
    entrePlanta: 2.5,
    nota: "3×2,5 m = 1 333 hijuelos/ha. Más junto = sigatoka y racimo chico.",
  },
  {
    id: "isla",
    cultivo: "platano",
    nombre: "Isla / seda",
    marco: "rectangular",
    entreSurco: 3,
    entrePlanta: 3,
    nota: "3×3 m = 1 111 pl/ha. Hoja grande: no copiar densidad de cacao.",
  },
];

export const ZONAS: ZonaDensidad[] = [
  {
    id: "tingo",
    nombre: "Tingo María · 650–800 msnm",
    factor: 1,
    nota: "Selva alta húmeda. Marco de catálogo, sin apretar.",
  },
  {
    id: "aucayacu",
    nombre: "Aucayacu · más lluvia",
    factor: 0.94,
    nota: "Más humedad: abre 6 % para aire y hongo.",
  },
  {
    id: "castillo",
    nombre: "Castillo Grande / ladera",
    factor: 0.9,
    nota: "Ladera: menos plantas, más suelo por raíz, menos volcadura.",
  },
  {
    id: "oeste",
    nombre: "Cara oeste (calor de tarde)",
    factor: 0.88,
    nota: "Menos densidad: el oeste es estrés, no más luz.",
  },
];

export function plantasPorHa(
  entreSurco: number,
  entrePlanta: number,
  marco: Marco,
) {
  if (entreSurco <= 0 || entrePlanta <= 0) return 0;
  if (marco === "tresbolillo") {
    return Math.round(10000 / (entreSurco * entrePlanta * (Math.sqrt(3) / 2)));
  }
  return Math.round(10000 / (entreSurco * entrePlanta));
}

export function aplicarFactores(base: number, zona: number, sueloApto: boolean) {
  const suelo = sueloApto ? 1 : 0.9;
  return Math.round(base * zona * suelo);
}

export function desdeConteo(plantas: number, ladoM: number) {
  if (ladoM <= 0) return 0;
  return Math.round((plantas / (ladoM * ladoM)) * 10000);
}

export function desdeEspaciamiento(
  entreSurco: number,
  entrePlanta: number,
  marco: Marco,
) {
  return plantasPorHa(entreSurco, entrePlanta, marco);
}

export type Veredicto = "junto" | "punto" | "separado";

export function veredicto(actual: number, ideal: number): {
  tipo: Veredicto;
  pct: number;
  titulo: string;
  texto: string;
} {
  if (!ideal) {
    return { tipo: "punto", pct: 0, titulo: "Sin referencia", texto: "Elige variedad." };
  }
  const pct = Math.round(((actual - ideal) / ideal) * 100);
  if (pct > 12) {
    return {
      tipo: "junto",
      pct,
      titulo: "Demasiado junto",
      texto: `Estás ${pct}% por encima del punto. Las plantas se pelean agua, luz y nutriente. En cacao/café sube hongo; en maíz el tallo se afina y el cogollero entra fácil.`,
    };
  }
  if (pct < -12) {
    return {
      tipo: "separado",
      pct,
      titulo: "Demasiado separado",
      texto: `Estás ${Math.abs(pct)}% por debajo. Desperdicias hectárea: el sol se va al suelo y la maleza gana la ventana crítica.`,
    };
  }
  return {
    tipo: "punto",
    pct,
    titulo: "En el punto correcto",
    texto: `Desvío ${pct}% respecto al marco de tu variedad y zona. Está dentro de la franja de alto rendimiento (±12 %).`,
  };
}

export function variedadesDe(cultivo: CultivoId) {
  return VARIEDADES.filter((item) => item.cultivo === cultivo);
}
