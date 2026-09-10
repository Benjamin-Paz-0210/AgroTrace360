/** Ecosistema real de agroexportación peruana. AgroTrace no reemplaza a SENASA ni a SGS: arma el expediente de campo para que el lote no llegue sucio a la inspección. */

export const EXPORTADORAS_REF = {
  cacao: [
    "Machu Picchu Foods",
    "Agro San Gerardo",
    "Cafetalera Amazónica",
    "Sumaqao",
    "ACOPAGRO",
  ],
  granos: [
    "Industria de Granos del Perú",
    "Ecoandino",
    "Inti Consorcio",
    "Agro Fergi",
    "Miranda Langa Agro Export",
  ],
};

export const CERTIFICADORAS = [
  { nombre: "SENASA", tipo: "Estado · fitosanitario (obligatorio)" },
  { nombre: "Control Union / Bio Latina / CAAE", tipo: "Orgánico UE · USDA · JAS" },
  { nombre: "SGS · LSQA · Bureau Veritas", tipo: "GLOBALG.A.P. · HACCP · inocuidad" },
  { nombre: "FLOCERT · Rainforest Alliance", tipo: "Comercio justo y bosque" },
];

export function expedienteExport(
  semaforo: "verde" | "ambar" | "rojo",
  cultivo = "",
) {
  const ok = semaforo === "verde";
  const esCacao = /cacao/i.test(cultivo);
  const esMaiz = /ma[ií]z/i.test(cultivo);
  const mercado = esCacao
    ? "Cacao hacia UE: cadmio y ocratoxina. El origen queda trazado al productor."
    : esMaiz
      ? "Maíz: SENASA vigila gorgojo e insectos de almacén. Un vivo rechaza el lote."
      : "Cacao: cadmio y ocratoxina. Maíz: insectos de almacén. El origen queda trazado al productor.";

  return [
    {
      id: "carencia",
      label: "Carencia / LMR",
      estado: ok ? "listo" : "bloquea",
      nota: ok
        ? "Sin activo en ventana. El inspector no debería hallar residuo de última aplicación."
        : "Aún en carencia. No pedir inspección SENASA ni embarque.",
    },
    {
      id: "fotos",
      label: "Evidencia de campo",
      estado: "listo" as const,
      nota: "Bitácora, densidad, sensores y fotos IA. Lo que pide una auditoría GLOBALG.A.P. o Control Union.",
    },
    {
      id: "senasa",
      label: "Listo para SENASA (VUCE)",
      estado: ok ? "listo" : "espera",
      nota: ok
        ? "El acopio puede solicitar inspección: planta de empaque, muestreo, certificado fitosanitario."
        : "SENASA no libera un lote con plaga, gorgojo o químico en carencia.",
    },
    {
      id: "ue",
      label: "Mercado UE / EE. UU.",
      estado: ok ? "listo" : "riesgo",
      nota: mercado,
    },
  ] as const;
}
