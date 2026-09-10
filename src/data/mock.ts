export type Role = "agricultor" | "acopio" | "exportadora";

export type ProcessStepId =
  | "semilla"
  | "densidad"
  | "nutricion"
  | "malezas"
  | "fitosanitario"
  | "cosecha";

export type StepStatus = "hecho" | "en_curso" | "pendiente" | "bloqueado";

export type BitacoraTipo =
  | "siembra"
  | "densidad"
  | "nutricion"
  | "malezas"
  | "fitosanitario"
  | "inspeccion"
  | "cosecha"
  | "acopio"
  | "embarque";

export type Semaforo = "verde" | "ambar" | "rojo";

export type ProcessStep = {
  id: ProcessStepId;
  label: string;
  status: StepStatus;
  detail: string;
};

export type BitacoraEntry = {
  id: string;
  fecha: string;
  tipo: BitacoraTipo;
  titulo: string;
  nota: string;
  autor: string;
  rol: Role;
};

export type NodoRuta = {
  id: string;
  nombre: string;
  tipo: "parcela" | "acopio" | "puerto" | "destino";
  coords: [number, number];
  fecha?: string;
  estado: "completado" | "en_transito" | "programado";
};

export type FotoCampo = {
  id: string;
  loteId: string;
  url: string;
  cultivo: string;
  calidadPlanta: number;
  enfermedad: string;
  confianzaEnfermedad: number;
  maleza: string;
  confianzaMaleza: number;
  tratamiento: string;
  createdAt: string;
  tipo?: string;
  causa?: string;
  aviso?: string;
  nombreCientifico?: string;
  match?: string | null;
  similitud?: number;
  fotoCatalogo?: string | null;
  productor?: string;
  variedad?: string;
};

export type RankingFila = {
  puesto: number;
  productorId: string;
  productor: string;
  loteId: string;
  variedad: string;
  semaforo: Semaforo;
  calidadExportPct: number;
  fotos: number;
  iaPromedio: number | null;
  score: number;
  seleccion?: string;
  acopioId?: string;
};

export type Lote = {
  id: string;
  productorId: string;
  productor: string;
  parcela: string;
  cultivo: string;
  variedad: string;
  sistema: string;
  plantasHa: number;
  areaHa: number;
  fechaPoda: string;
  semaforo: Semaforo;
  diasCarenciaRestantes: number;
  calidadExportPct: number;
  pasos: ProcessStep[];
  bitacora: BitacoraEntry[];
  ruta: NodoRuta[];
  fotos: FotoCampo[];
  acopioId?: string;
  seleccion?: string;
};

export type Productor = {
  id: string;
  nombre: string;
  comunidad: string;
  hectareas: number;
  loteIds: string[];
};

export const COOPERATIVA = "Cooperativa piloto Alto Huallaga";
export const EXPORTADORA = "Exportadora Huánuco Selva Central";
export const DESTINO = "Puerto de Rotterdam, Países Bajos";
export const CONTENEDOR = "MSCU-849201";

export const PRODUCTORES: Productor[] = [
  {
    id: "prod-jose",
    nombre: "José Huamán Quispe",
    comunidad: "Tingo María · 670 msnm",
    hectareas: 1.5,
    loteIds: ["LOT-TM-001"],
  },
  {
    id: "prod-elena",
    nombre: "Elena Ríos Pinedo",
    comunidad: "Aucayacu",
    hectareas: 2.2,
    loteIds: ["LOT-TM-002"],
  },
  {
    id: "prod-pedro",
    nombre: "Pedro Vásquez Tello",
    comunidad: "Castillo Grande",
    hectareas: 0.8,
    loteIds: ["LOT-TM-003"],
  },
];

const rutaJose: NodoRuta[] = [
  {
    id: "n1",
    nombre: "Parcela Tingo María",
    tipo: "parcela",
    coords: [-9.295, -76.0],
    fecha: "2026-03-15",
    estado: "completado",
  },
  {
    id: "n2",
    nombre: "Acopio Alto Huallaga",
    tipo: "acopio",
    coords: [-9.3, -76.0],
    fecha: "2026-09-24",
    estado: "programado",
  },
  {
    id: "n3",
    nombre: "Puerto del Callao",
    tipo: "puerto",
    coords: [-12.054, -77.151],
    fecha: "2026-10-02",
    estado: "programado",
  },
  {
    id: "n4",
    nombre: "Rotterdam, UE",
    tipo: "destino",
    coords: [51.9225, 4.47917],
    fecha: "2026-10-28",
    estado: "programado",
  },
];

export function lotesSemilla(): Lote[] {
  return [
    {
      id: "LOT-TM-001",
      productorId: "prod-jose",
      productor: "José Huamán Quispe",
      parcela: "Caserío cerca a Tingo María, 1.5 ha",
      cultivo: "Cacao",
      variedad: "CCN-51",
      sistema: "tresbolillo 3×3 m",
      plantasHa: 1283,
      areaHa: 1.5,
      fechaPoda: "2026-03-15",
      semaforo: "verde",
      diasCarenciaRestantes: 0,
      calidadExportPct: 92,
      pasos: [
        {
          id: "semilla",
          label: "Semilla y clon",
          status: "hecho",
          detail: "CCN-51 de vivero certificado SENASA / INIA",
        },
        {
          id: "densidad",
          label: "Densidad y trazo",
          status: "hecho",
          detail: "1 283 pl/ha · surcos N-S por baja radiación",
        },
        {
          id: "nutricion",
          label: "Nutrición por etapa",
          status: "en_curso",
          detail: "Llenado: potasio y calcio · factor densidad ×1.0",
        },
        {
          id: "malezas",
          label: "Ventana de malezas",
          status: "hecho",
          detail: "Plateo en días 0–45 post-poda · se evitó el −70%",
        },
        {
          id: "fitosanitario",
          label: "Fitosanitario",
          status: "hecho",
          detail: "Cobre 12 jul · un solo activo · carencia cumplida",
        },
        {
          id: "cosecha",
          label: "Cosecha y salida",
          status: "pendiente",
          detail: "Semáforo verde: el acopio puede emitir salida",
        },
      ],
      bitacora: [
        {
          id: "b1",
          fecha: "2026-03-15",
          tipo: "siembra",
          titulo: "Poda de producción y registro del clon",
          nota: "Se registra CCN-51 certificado. Jardín clonal INIA.",
          autor: "José Huamán",
          rol: "agricultor",
        },
        {
          id: "b2",
          fecha: "2026-03-16",
          tipo: "densidad",
          titulo: "Marco tresbolillo 3×3",
          nota: "1 283 plantas/ha. Surcos norte-sur para captar radiación en selva alta.",
          autor: "María Pérez",
          rol: "acopio",
        },
        {
          id: "b3",
          fecha: "2026-04-02",
          tipo: "malezas",
          titulo: "Plateo en ventana crítica",
          nota: "Deshierbe de corona. Sin herbicida sobre plantón.",
          autor: "José Huamán",
          rol: "agricultor",
        },
        {
          id: "b4",
          fecha: "2026-06-10",
          tipo: "nutricion",
          titulo: "Abono de floración",
          nota: "Boro, zinc y calcio. No se siguió solo con nitrógeno.",
          autor: "José Huamán",
          rol: "agricultor",
        },
        {
          id: "b5",
          fecha: "2026-07-12",
          tipo: "fitosanitario",
          titulo: "Hidróxido de cobre · monilia",
          nota: "50 g / mochila 20 L. Un solo activo. Carencia 7 días, ya cumplida.",
          autor: "José Huamán",
          rol: "agricultor",
        },
        {
          id: "b6",
          fecha: "2026-09-08",
          tipo: "inspeccion",
          titulo: "Inspección de acopio",
          nota: "Lote apto. Calidad preliminar 92% para exportación UE.",
          autor: "María Pérez",
          rol: "acopio",
        },
      ],
      ruta: rutaJose,
      fotos: [],
    },
    {
      id: "LOT-TM-002",
      productorId: "prod-elena",
      productor: "Elena Ríos Pinedo",
      parcela: "Aucayacu, 2.2 ha",
      cultivo: "Cacao",
      variedad: "VRAE-99",
      sistema: "cuadrado 3×3 m",
      plantasHa: 1111,
      areaHa: 2.2,
      fechaPoda: "2026-04-01",
      semaforo: "ambar",
      diasCarenciaRestantes: 9,
      calidadExportPct: 71,
      pasos: [
        {
          id: "semilla",
          label: "Semilla y clon",
          status: "hecho",
          detail: "VRAE-99",
        },
        {
          id: "densidad",
          label: "Densidad y trazo",
          status: "hecho",
          detail: "1 111 pl/ha",
        },
        {
          id: "nutricion",
          label: "Nutrición por etapa",
          status: "hecho",
          detail: "Calendario al día",
        },
        {
          id: "malezas",
          label: "Ventana de malezas",
          status: "hecho",
          detail: "Control mecánico",
        },
        {
          id: "fitosanitario",
          label: "Fitosanitario",
          status: "en_curso",
          detail: "Aplicación del 1 sep · carencia 14 días",
        },
        {
          id: "cosecha",
          label: "Cosecha y salida",
          status: "bloqueado",
          detail: "Bloqueado: faltan 9 días de carencia",
        },
      ],
      bitacora: [
        {
          id: "e1",
          fecha: "2026-04-01",
          tipo: "siembra",
          titulo: "Alta de parcela VRAE-99",
          nota: "Material de vivero local.",
          autor: "Elena Ríos",
          rol: "agricultor",
        },
        {
          id: "e2",
          fecha: "2026-09-01",
          tipo: "fitosanitario",
          titulo: "Tratamiento monilia",
          nota: "Un solo producto. Cosecha bloqueada hasta el 15 sep.",
          autor: "Elena Ríos",
          rol: "agricultor",
        },
      ],
      ruta: [
        {
          id: "e-n1",
          nombre: "Parcela Aucayacu",
          tipo: "parcela",
          coords: [-8.89, -76.13],
          fecha: "2026-04-01",
          estado: "completado",
        },
        {
          id: "e-n2",
          nombre: "Acopio Alto Huallaga",
          tipo: "acopio",
          coords: [-9.3, -76.0],
          estado: "programado",
        },
        {
          id: "e-n3",
          nombre: "Puerto del Callao",
          tipo: "puerto",
          coords: [-12.054, -77.151],
          estado: "programado",
        },
        {
          id: "e-n4",
          nombre: "Rotterdam, UE",
          tipo: "destino",
          coords: [51.9225, 4.47917],
          estado: "programado",
        },
      ],
      fotos: [],
    },
    {
      id: "LOT-TM-003",
      productorId: "prod-pedro",
      productor: "Pedro Vásquez Tello",
      parcela: "Castillo Grande, 0.8 ha",
      cultivo: "Cacao",
      variedad: "Nativo fino de aroma",
      sistema: "tresbolillo 3×3 m",
      plantasHa: 1283,
      areaHa: 0.8,
      fechaPoda: "2026-02-20",
      semaforo: "verde",
      diasCarenciaRestantes: 0,
      calidadExportPct: 88,
      pasos: [
        {
          id: "semilla",
          label: "Semilla y clon",
          status: "hecho",
          detail: "Nativo fino de aroma",
        },
        {
          id: "densidad",
          label: "Densidad y trazo",
          status: "hecho",
          detail: "1 283 pl/ha",
        },
        {
          id: "nutricion",
          label: "Nutrición por etapa",
          status: "hecho",
          detail: "Plan de 17 nutrientes",
        },
        {
          id: "malezas",
          label: "Ventana de malezas",
          status: "hecho",
          detail: "Ventana cerrada a tiempo",
        },
        {
          id: "fitosanitario",
          label: "Fitosanitario",
          status: "hecho",
          detail: "Sin aplicaciones en carencia",
        },
        {
          id: "cosecha",
          label: "Cosecha y salida",
          status: "en_curso",
          detail: "Listo para acopio de aroma fino",
        },
      ],
      bitacora: [
        {
          id: "p1",
          fecha: "2026-02-20",
          tipo: "siembra",
          titulo: "Registro de nativo fino",
          nota: "Lote diferenciado para mercado de aroma.",
          autor: "Pedro Vásquez",
          rol: "agricultor",
        },
        {
          id: "p2",
          fecha: "2026-08-20",
          tipo: "acopio",
          titulo: "Muestra de calidad",
          nota: "Fermentación y secado controlados. 88% apto export.",
          autor: "María Pérez",
          rol: "acopio",
        },
      ],
      ruta: [
        {
          id: "p-n1",
          nombre: "Castillo Grande",
          tipo: "parcela",
          coords: [-9.21, -76.03],
          fecha: "2026-02-20",
          estado: "completado",
        },
        {
          id: "p-n2",
          nombre: "Acopio Alto Huallaga",
          tipo: "acopio",
          coords: [-9.3, -76.0],
          fecha: "2026-09-18",
          estado: "en_transito",
        },
        {
          id: "p-n3",
          nombre: "Puerto del Callao",
          tipo: "puerto",
          coords: [-12.054, -77.151],
          fecha: "2026-09-30",
          estado: "programado",
        },
        {
          id: "p-n4",
          nombre: "Rotterdam, UE",
          tipo: "destino",
          coords: [51.9225, 4.47917],
          fecha: "2026-10-22",
          estado: "programado",
        },
      ],
      fotos: [],
    },
  ];
}

export const TIPO_LABEL: Record<BitacoraTipo, string> = {
  siembra: "Semilla",
  densidad: "Densidad",
  nutricion: "Nutrición",
  malezas: "Malezas",
  fitosanitario: "Fitosanitario",
  inspeccion: "Inspección",
  cosecha: "Cosecha",
  acopio: "Acopio",
  embarque: "Embarque",
};

export const IMG = {
  hero: "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?auto=format&fit=crop&w=2000&q=80",
  field: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80",
  hands: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80",
  port: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=80",
};
