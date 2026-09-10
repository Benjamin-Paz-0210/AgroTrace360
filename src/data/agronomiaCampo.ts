export type CultivoId = "cacao" | "maiz" | "cafe" | "platano";

export type SensorPunto = {
  id: string;
  fila: number;
  col: number;
  etiqueta: string;
  ph: number;
  humedadPct: number;
  moPct: number;
  n: number;
  p: number;
  k: number;
  boro: number;
  zinc: number;
};

export type RangoSuelo = {
  ph: [number, number];
  moMin: number;
  nMin: number;
  pMin: number;
  kMin: number;
  boroMin: number;
  zincMin: number;
  nota: string;
};

export type PlanOrganico = {
  semanaInicio: number;
  semanaFin: number;
  accion: string;
};

export type HallazgoIa = {
  id: string;
  cultivo: CultivoId;
  tipo?: "enfermedad" | "plaga" | "sano" | "sin_match";
  calidadPlantaPct: number;
  enfermedad: string;
  confianzaEnfermedad: number;
  maleza: string;
  confianzaMaleza: number;
  causa?: string;
  tratamiento: string;
  aviso: string;
  nombreCientifico?: string;
  match?: string;
  similitud?: number;
  fotoCatalogo?: string | null;
};

export const CULTIVOS: { id: CultivoId; nombre: string }[] = [
  { id: "cacao", nombre: "Cacao" },
  { id: "maiz", nombre: "Maíz amarillo duro" },
  { id: "cafe", nombre: "Café" },
  { id: "platano", nombre: "Plátano" },
];

export const REQUISITOS: Record<CultivoId, RangoSuelo> = {
  cacao: {
    ph: [6.0, 7.2],
    moMin: 3,
    nMin: 30,
    pMin: 12,
    kMin: 120,
    boroMin: 0.5,
    zincMin: 1.2,
    nota: "Cacao exige pH cercano a neutro, materia orgánica y boro/zinc para cuajado.",
  },
  maiz: {
    ph: [5.5, 7.0],
    moMin: 2,
    nMin: 40,
    pMin: 15,
    kMin: 100,
    boroMin: 0.3,
    zincMin: 1.0,
    nota: "Maíz amarillo duro (charla de campo): N y P altos, Zn foliar en V4–V6. pH ácido fija el zinc. Sembrar con lluvia SENAMHI, no porque 'haga calor'.",
  },
  cafe: {
    ph: [5.0, 6.5],
    moMin: 3.5,
    nMin: 28,
    pMin: 10,
    kMin: 110,
    boroMin: 0.4,
    zincMin: 1.0,
    nota: "Café tolera algo más de acidez si hay materia orgánica alta.",
  },
  platano: {
    ph: [5.8, 7.0],
    moMin: 2.5,
    nMin: 35,
    pMin: 12,
    kMin: 150,
    boroMin: 0.4,
    zincMin: 1.0,
    nota: "Plátano es muy exigente en potasio.",
  },
};

export const SENSORES_TINGO: SensorPunto[] = [
  { id: "A1", fila: 0, col: 0, etiqueta: "A1", ph: 5.1, humedadPct: 78, moPct: 2.1, n: 22, p: 7, k: 88, boro: 0.22, zinc: 0.7 },
  { id: "A2", fila: 0, col: 1, etiqueta: "A2", ph: 5.3, humedadPct: 81, moPct: 2.4, n: 24, p: 8, k: 92, boro: 0.25, zinc: 0.8 },
  { id: "A3", fila: 0, col: 2, etiqueta: "A3", ph: 5.0, humedadPct: 84, moPct: 1.9, n: 20, p: 6, k: 80, boro: 0.18, zinc: 0.6 },
  { id: "A4", fila: 0, col: 3, etiqueta: "A4", ph: 5.4, humedadPct: 76, moPct: 2.6, n: 26, p: 9, k: 98, boro: 0.28, zinc: 0.9 },
  { id: "B1", fila: 1, col: 0, etiqueta: "B1", ph: 5.2, humedadPct: 79, moPct: 2.2, n: 23, p: 7, k: 90, boro: 0.21, zinc: 0.75 },
  { id: "B2", fila: 1, col: 1, etiqueta: "B2", ph: 5.6, humedadPct: 72, moPct: 2.8, n: 28, p: 11, k: 110, boro: 0.34, zinc: 1.0 },
  { id: "B3", fila: 1, col: 2, etiqueta: "B3", ph: 5.5, humedadPct: 74, moPct: 2.7, n: 27, p: 10, k: 105, boro: 0.31, zinc: 0.95 },
  { id: "B4", fila: 1, col: 3, etiqueta: "B4", ph: 5.3, humedadPct: 80, moPct: 2.3, n: 24, p: 8, k: 93, boro: 0.24, zinc: 0.82 },
  { id: "C1", fila: 2, col: 0, etiqueta: "C1", ph: 4.9, humedadPct: 86, moPct: 1.8, n: 18, p: 5, k: 74, boro: 0.15, zinc: 0.55 },
  { id: "C2", fila: 2, col: 1, etiqueta: "C2", ph: 5.2, humedadPct: 82, moPct: 2.0, n: 21, p: 7, k: 85, boro: 0.2, zinc: 0.68 },
  { id: "C3", fila: 2, col: 2, etiqueta: "C3", ph: 5.4, humedadPct: 77, moPct: 2.5, n: 25, p: 9, k: 97, boro: 0.27, zinc: 0.88 },
  { id: "C4", fila: 2, col: 3, etiqueta: "C4", ph: 5.1, humedadPct: 83, moPct: 2.1, n: 22, p: 6, k: 86, boro: 0.19, zinc: 0.7 },
];

const HALLAZGOS: HallazgoIa[] = [
  {
    id: "cac-monilia",
    cultivo: "cacao",
    calidadPlantaPct: 68,
    enfermedad: "Moniliasis (Moniliophthora roreri)",
    confianzaEnfermedad: 86,
    maleza: "Coquito / Cyperus en corona — competencia de luz",
    confianzaMaleza: 79,
    tratamiento:
      "Recolectar mazorcas enfermas esta semana. Un solo cobre preventivo 50 g/mochila 20 L. Plateo mecánico, no herbicida sobre fruto. No mezclar activos.",
    aviso: "Si no se controla en 10 días, el foco se mueve al resto del acopio.",
  },
  {
    id: "cac-phyt",
    cultivo: "cacao",
    calidadPlantaPct: 74,
    enfermedad: "Mazorca negra (Phytophthora)",
    confianzaEnfermedad: 81,
    maleza: "Hoja ancha en surco — ventana crítica activa",
    confianzaMaleza: 73,
    tratamiento:
      "Mejorar drenaje y sombra. Cobre en dosis de catálogo. Deshierbe de corona en 48 h para no perder hasta 70% del rendimiento.",
    aviso: "El agricultor no tiene que nombrar la maleza: el dataset ya la clasificó.",
  },
  {
    id: "cac-sano",
    cultivo: "cacao",
    calidadPlantaPct: 91,
    enfermedad: "Sin enfermedad dominante",
    confianzaEnfermedad: 77,
    maleza: "Cobertura baja, sin competencia fuerte",
    confianzaMaleza: 71,
    tratamiento:
      "Mantener plateo ligero y plan de potasio de llenado. No aplicar químico 'por si acaso'.",
    aviso: "Calidad alta. El acopio puede usar esta foto como evidencia de manejo.",
  },
  {
    id: "mz-cogollero",
    cultivo: "maiz",
    calidadPlantaPct: 64,
    enfermedad: "Gusano cogollero (Spodoptera frugiperda)",
    confianzaEnfermedad: 84,
    maleza: "Gramínea en el surco — competencia temprana",
    confianzaMaleza: 80,
    tratamiento:
      "Bacillus thuringiensis 30 ml/mochila 20 L (carencia 3 días). Deshierbe ahora. Un solo activo.",
    aviso: "Detectado en etapa vulnerable. Esperar a ver el daño a ojo llega tarde.",
  },
  {
    id: "cf-roya",
    cultivo: "cafe",
    calidadPlantaPct: 70,
    enfermedad: "Roya del cafeto",
    confianzaEnfermedad: 82,
    maleza: "Malezas en plateo — humedad alta",
    confianzaMaleza: 70,
    tratamiento:
      "Manejo de sombra y recojo de hojas. Cobre preventivo si el acopio lo autoriza. Plateo.",
    aviso: "Foto georreferenciada avisa al técnico antes del brote masivo.",
  },
  {
    id: "pl-sigatoka",
    cultivo: "platano",
    calidadPlantaPct: 72,
    enfermedad: "Sigatoka",
    confianzaEnfermedad: 80,
    maleza: "Heliconia / maleza de corona",
    confianzaMaleza: 68,
    tratamiento:
      "Deshoje sanitario y deshierbe. Evitar mezclas. Potasio foliar según plan.",
    aviso: "El dataset local de plátano reduce la adivinanza en campo.",
  },
];

export function promedioSensores(puntos: SensorPunto[]) {
  const n = puntos.length || 1;
  const sum = puntos.reduce(
    (acc, p) => ({
      ph: acc.ph + p.ph,
      humedadPct: acc.humedadPct + p.humedadPct,
      moPct: acc.moPct + p.moPct,
      n: acc.n + p.n,
      p: acc.p + p.p,
      k: acc.k + p.k,
      boro: acc.boro + p.boro,
      zinc: acc.zinc + p.zinc,
    }),
    { ph: 0, humedadPct: 0, moPct: 0, n: 0, p: 0, k: 0, boro: 0, zinc: 0 },
  );
  return {
    ph: sum.ph / n,
    humedadPct: sum.humedadPct / n,
    moPct: sum.moPct / n,
    n: sum.n / n,
    p: sum.p / n,
    k: sum.k / n,
    boro: sum.boro / n,
    zinc: sum.zinc / n,
  };
}

export function evaluarSuelo(cultivo: CultivoId, puntos: SensorPunto[]) {
  const avg = promedioSensores(puntos);
  const req = REQUISITOS[cultivo];
  const fallas: string[] = [];
  if (avg.ph < req.ph[0] || avg.ph > req.ph[1]) {
    fallas.push(
      `pH ${avg.ph.toFixed(1)} fuera de ${req.ph[0]}–${req.ph[1]}`,
    );
  }
  if (avg.moPct < req.moMin) fallas.push(`Materia orgánica ${avg.moPct.toFixed(1)}% < ${req.moMin}%`);
  if (avg.n < req.nMin) fallas.push(`Nitrógeno bajo`);
  if (avg.p < req.pMin) fallas.push(`Fósforo bajo`);
  if (avg.k < req.kMin) fallas.push(`Potasio bajo`);
  if (avg.boro < req.boroMin) fallas.push(`Boro deficiente`);
  if (avg.zinc < req.zincMin) fallas.push(`Zinc deficiente`);
  const apto = fallas.length === 0;
  const plan: PlanOrganico[] = apto
    ? [
        {
          semanaInicio: 0,
          semanaFin: 4,
          accion: "Mantener cobertura y compost de mantenimiento (1 bulto/ha).",
        },
        {
          semanaInicio: 4,
          semanaFin: 12,
          accion: "Los sensores siguen midiendo. No cal agrícola si el pH ya está en rango.",
        },
      ]
    : [
        {
          semanaInicio: 0,
          semanaFin: 4,
          accion:
            "Cal agrícola + compost/bocashi en los puntos ácidos (C1, A3). No sembrar aún si el pH < 5.5 para cacao.",
        },
        {
          semanaInicio: 4,
          semanaFin: 12,
          accion:
            "Abono orgánico fraccionado (compost + estiércol curtido). Releer sensores cada 15 días: no hace falta sacar otra calicata.",
        },
        {
          semanaInicio: 12,
          semanaFin: 24,
          accion:
            "Si pH y materia orgánica entran al rango, instalar el cultivo. Si no, repetir ciclo orgánico. Micronutrientes (B, Zn) en dosis foliar ligera.",
        },
      ];
  return { avg, req, fallas, apto, plan };
}

export function diagnosticarFoto(cultivo: CultivoId, fileSize: number): HallazgoIa {
  const pool = HALLAZGOS.filter((item) => item.cultivo === cultivo);
  const list = pool.length ? pool : HALLAZGOS;
  const picked = list[fileSize % list.length];
  return picked ?? HALLAZGOS[0];
}

export const DIAS_SIN_FOTO = 18;
