import type { CultivoId } from "./agronomiaCampo";

export type PasoFoliar = {
  n: number;
  titulo: string;
  texto: string;
};

export type GuiaCultivo = {
  id: CultivoId;
  nombre: string;
  enfasis?: string;
  fotoCampo: string;
  fotoFoliar: string;
  siembra: {
    cuando: string;
    lluviaMinMm: number;
    lluviaMax48h: number;
    noSembrarSi: string;
  };
  horizonte: {
    hacia: string;
    porQue: string;
    evitar: string;
  };
  foliar: {
    paraQue: string;
    producto: string;
    dosis: string;
    momento: string;
    como: PasoFoliar[];
    noHacer: string[];
  };
};

export const GUIAS: Record<CultivoId, GuiaCultivo> = {
  maiz: {
    id: "maiz",
    nombre: "Maíz amarillo duro",
    enfasis:
      "Es el cultivo de caja corta de la charla: 110–120 días, densidad 50–55 mil pl/ha (0,80 × 0,25 m). El cacao llena después; el maíz paga ahora si se siembra con lluvia real y zinc a tiempo.",
    fotoCampo: "/uploads/guias/maiz-produccion.jpg",
    fotoFoliar: "/uploads/guias/fol-maiz.jpg",
    siembra: {
      cuando:
        "Cuando SENAMHI / la estación de Tingo María acumula unos 40 mm en 7 días y el suelo está húmedo a 5 cm, no lodazal. Campaña Huallaga: tras el arranque de lluvias (no en el pico de aguacero).",
      lluviaMinMm: 40,
      lluviaMax48h: 35,
      noSembrarSi:
        "Si en 48 h vienen más de 35 mm: la semilla se pudre. Si hay calor pero menos de 20 mm en 7 días: nace desparejo.",
    },
    horizonte: {
      hacia: "Este (salida del sol) · surcos Norte–Sur",
      porQue:
        "La planta usa la radiación de la mañana, cuando el estoma está abierto y el estrés es bajo. En el Huallaga el calor de la tarde (oeste) sube la temperatura del aire, no la fotosíntesis. Calor ≠ más luz.",
      evitar:
        "Ladera que mira al oeste: horno de tarde, menos llenado de grano, más cogollero y más evaporación.",
    },
    foliar: {
      paraQue:
        "Zinc y potasio por la hoja. En suelos ácidos del Huallaga el Zn se fija: el maíz lo muestra en V4–V6 (hojas nuevas pálidas con franjas).",
      producto: "Sulfato de zinc (nutrición). No confundir con Bacillus para cogollero.",
      dosis: "200 g / mochila 20 L · mojar el cogollo y el envés. 1 ha ≈ 4–5 mochilas.",
      momento: "V4 a V6 (4 a 6 hojas). Segunda: prefloración, nitrato de potasio 150 g / 20 L.",
      como: [
        {
          n: 1,
          titulo: "Agua limpia, un solo producto",
          texto: "Llenar la mochila. Disolver el zinc. No mezclar con herbicida ni con el BT del cogollero.",
        },
        {
          n: 2,
          titulo: "Tirar al cogollo y al envés",
          texto: "La foto guía: chorro al embudo de la planta. Ahí está el tejido nuevo. El haz de la hoja escurre.",
        },
        {
          n: 3,
          titulo: "Hora: 6:30–9:00 o 16:00–17:30",
          texto: "Cuando la radiación esté entre 200 y 500 W/m². Si el tablero marca 800 W y 31 °C, espera: quema y no entra.",
        },
        {
          n: 4,
          titulo: "Mira la lluvia a 6 horas",
          texto: "Si SENAMHI / el pronóstico trae más de 3 mm, no foliar: se lava. Mañana otra vez.",
        },
      ],
      noHacer: [
        "No foliar al mediodía porque 'hace sol': ese sol es calor, no siempre radiación útil.",
        "No aplicar zinc después de V8: ya no corrige el llenado.",
        "No usar la misma mochila del herbicida sin enjuagar.",
      ],
    },
  },
  cacao: {
    id: "cacao",
    nombre: "Cacao",
    fotoCampo: "/uploads/guias/horizonte-este.jpg",
    fotoFoliar: "/uploads/guias/fol-cacao.jpg",
    siembra: {
      cuando:
        "Plantón certificado al inicio de lluvias útiles (suelo húmedo sostenido, no crecida). Hoyos 40×40×40 con materia orgánica. No en el mes más seco ni con el río encima.",
      lluviaMinMm: 50,
      lluviaMax48h: 50,
      noSembrarSi: "Encharque o menos de 30 mm en 10 días: el plantón se seca o se asfixia.",
    },
    horizonte: {
      hacia: "Este–sureste, con sombra temporal al oeste",
      porQue:
        "El cacao quiere luz filtrada de mañana. La ladera oeste recibe el golpe de calor de la tarde y dispara monilia. Otra vez: temperatura alta no es más radiación para cuajar.",
      evitar: "Fila contra el sol de las 14:00 sin sombra. Mazorca quemada y más Phytophthora si hay humedad.",
    },
    foliar: {
      paraQue: "Boro y zinc en floración; potasio en llenado de mazorca. El cobre es fitosanitario, no abono.",
      producto: "Boro (borato) + zinc quelatado en flor. Potasio foliar en llenado.",
      dosis: "Boro 50 g + Zn 80 g / mochila 20 L. K foliar 150 g / 20 L. Mojar envés.",
      momento: "Preflor y cuajado. Llenado cada 20 días. Nunca con cobre el mismo día.",
      como: [
        {
          n: 1,
          titulo: "Mojar el envés",
          texto: "Los estomas del cacao están abajo. La foto: niebla fina, no chorro que escurre al suelo.",
        },
        {
          n: 2,
          titulo: "Sombra y mañana",
          texto: "6:30–9:00. Si la radiación pasa de 600 W/m², el foliar marca la hoja.",
        },
        {
          n: 3,
          titulo: "Un activo por mochila",
          texto: "Hoy nutrición. Mañana, si toca, cobre. No cóctel.",
        },
        {
          n: 4,
          titulo: "Sin lluvia a 6 h",
          texto: "Igual que maíz: si el mapa de precipitación carga, espera.",
        },
      ],
      noHacer: [
        "No foliar con fruto mojado por rocío pesado: escurre.",
        "No sustituir el compost de suelo con foliar. El foliar es el ajuste fino.",
      ],
    },
  },
  cafe: {
    id: "cafe",
    nombre: "Café",
    fotoCampo: "/uploads/guias/horizonte-este.jpg",
    fotoFoliar: "/uploads/guias/fol-cafe.jpg",
    siembra: {
      cuando:
        "Al arranque de lluvias, con sombra. El café joven no aguanta el seco ni el golpe de oeste.",
      lluviaMinMm: 45,
      lluviaMax48h: 45,
      noSembrarSi: "Verano relativo (junio–agosto en Huánuco) sin riego: el plantón aborta.",
    },
    horizonte: {
      hacia: "Este, con sombra al oeste (guaba / plátano)",
      porQue:
        "La radiación de mañana cuaja flor. El calor de tarde con sol directo dispara roya y caída de grano. El termómetro miente si hay nubes: puede hacer calor con poca luz.",
      evitar: "Cara oeste pelada. Más estrés, menos cereza.",
    },
    foliar: {
      paraQue: "Zinc y boro preflor. Magnesio si hay amarillamiento internerval.",
      producto: "Zn + B preflor. Sulfato de magnesio si el sensor muestra Mg bajo.",
      dosis: "Zn 80 g + B 40 g / 20 L. Mg 200 g / 20 L.",
      momento: "Prefloración y postcosecha. No en plena cosecha.",
      como: [
        {
          n: 1,
          titulo: "Gota fina en bandolas",
          texto: "Recorrer la planta de abajo hacia arriba. Envés de hoja.",
        },
        {
          n: 2,
          titulo: "Mañana nublada es buena",
          texto: "Nublado con 300 W/m² es mejor foliar que 32 °C con cielo blanco.",
        },
        {
          n: 3,
          titulo: "Separar del cobre de roya",
          texto: "Cobre un día. Nutrición otro. El cóctel quema.",
        },
        {
          n: 4,
          titulo: "Chequear lluvia SENAMHI",
          texto: "Más de 3 mm en 6 h: no salgas con la mochila.",
        },
      ],
      noHacer: [
        "No foliar con grano en cereza madura: mancha taza.",
        "No usar urea foliar fuerte al mediodía.",
      ],
    },
  },
  platano: {
    id: "platano",
    nombre: "Plátano",
    fotoCampo: "/uploads/guias/horizonte-este.jpg",
    fotoFoliar: "/uploads/guias/fol-platano.jpg",
    siembra: {
      cuando:
        "Hijos certificados con lluvia ya armada. El plátano es 80% agua: sin precipitación útil no hay hijo.",
      lluviaMinMm: 60,
      lluviaMax48h: 60,
      noSembrarSi: "Suelo saturado más de dos días: pudrición del cormo.",
    },
    horizonte: {
      hacia: "Este, filas que cortan el viento del oeste",
      porQue:
        "Hoja enorme: necesita luz de mañana y resguardo del viento-calor de tarde. Alta temperatura con baja radiación = hoja larga y débil, más sigatoka.",
      evitar: "Fila abierta al oeste sin cortina. Quiebre de hoja y más hongo.",
    },
    foliar: {
      paraQue: "Potasio y magnesio. El plátano es muy exigente en K; el foliar cubre el pico de parición.",
      producto: "Nitrato de potasio + Mg. No sustituye el K de suelo.",
      dosis: "K 200 g + Mg 150 g / mochila 20 L. Mojar haz y envés de hoja 2–3.",
      momento: "Antes de parición y cada 20 días en llenado del racimo.",
      como: [
        {
          n: 1,
          titulo: "Hoja 2 y 3, los dos lados",
          texto: "La foto: niebla sobre la lámina grande. No gastar caldo en hoja vieja de abajo.",
        },
        {
          n: 2,
          titulo: "Temprano, con poco viento",
          texto: "6:30–9:00. Viento del oeste de tarde desperdicia el caldo.",
        },
        {
          n: 3,
          titulo: "Separar del deshoje de sigatoka",
          texto: "Primero deshoje sanitario. Al día siguiente foliar nutrición.",
        },
        {
          n: 4,
          titulo: "Sin chubasco",
          texto: "Si el acumulado a 6 h pasa 3 mm, suspende.",
        },
      ],
      noHacer: [
        "No foliar con aceite agrícola el mismo día que K: fitotoxicidad.",
        "No pensar que 34 °C 'ayuda al racimo': si la radiación está baja, no llena.",
      ],
    },
  },
};

export const FOTO_LLUVIA = "/uploads/guias/lluvia-siembra.jpg";
export const FOTO_HORIZONTE = "/uploads/guias/horizonte-este.jpg";

export const HORIZONTES = [
  {
    id: "N",
    label: "Norte",
    ok: false,
    texto: "Poca variación en Tingo María (~9°S). No es el eje útil.",
  },
  {
    id: "E",
    label: "Este",
    ok: true,
    texto: "Sí. Radiación de mañana. Ahí se siembra y se foliar.",
  },
  {
    id: "S",
    label: "Sur",
    ok: false,
    texto: "Surcos N–S sí; la cara del cerro que mira al sur no es la prioridad.",
  },
  {
    id: "O",
    label: "Oeste",
    ok: false,
    texto: "No. Calor de tarde, más estrés, no más fotosíntesis.",
  },
];
