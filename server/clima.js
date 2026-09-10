const TINGO = {
  lat: -9.295,
  lon: -76.0,
  nombre: "Tingo María · Huánuco",
  senamhi: "Estación referencial SENAMHI Tingo María",
};

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function climaTingo() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    TINGO.lat +
    "&longitude=" +
    TINGO.lon +
    "&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,shortwave_radiation_sum" +
    "&hourly=temperature_2m,shortwave_radiation,precipitation" +
    "&timezone=America%2FLima&forecast_days=7";
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo leer el clima de la zona");
  const data = await res.json();
  const daily = data.daily || {};
  const hourly = data.hourly || {};

  const dias = (daily.time || []).map((fecha, i) => {
    const lluvia = num(daily.precipitation_sum?.[i]);
    const tMax = num(daily.temperature_2m_max?.[i]);
    const tMin = num(daily.temperature_2m_min?.[i]);
    const radiacion = num(daily.shortwave_radiation_sum?.[i]);
    const calorSinLuz = tMax >= 30 && radiacion < 18;
    const luzSinCalorExtremo = radiacion >= 20 && tMax < 30;
    return {
      fecha,
      lluviaMm: Math.round(lluvia * 10) / 10,
      tMax,
      tMin,
      radiacionMj: Math.round(radiacion * 10) / 10,
      calorSinLuz,
      luzSinCalorExtremo,
      nota: calorSinLuz
        ? "Hace calor, pero hay poca radiación (nubes). No es día de llenado ni de foliar al medio día."
        : luzSinCalorExtremo
          ? "Buena luz con temperatura razonable: fotosíntesis, no estrés."
          : lluvia >= 15
            ? "Día de lluvia útil. No foliar. Sí cuenta para armar siembra."
            : "Día intermedio. Mira radiación, no solo el termómetro.",
    };
  });

  const lluvia7 = dias.reduce((acc, d) => acc + d.lluviaMm, 0);
  const lluvia48 = dias.slice(0, 2).reduce((acc, d) => acc + d.lluviaMm, 0);

  const ahora = new Date();
  const limaHour = new Date(
    ahora.toLocaleString("en-US", { timeZone: "America/Lima" }),
  );
  const horas = (hourly.time || []).map((iso, i) => ({
    iso,
    hora: iso.slice(11, 16),
    t: num(hourly.temperature_2m?.[i]),
    w: num(hourly.shortwave_radiation?.[i]),
    lluvia: num(hourly.precipitation?.[i]),
  }));
  const proximas = horas.filter((h) => new Date(h.iso) >= limaHour).slice(0, 12);
  const lluvia6h = proximas.slice(0, 6).reduce((acc, h) => acc + h.lluvia, 0);
  const ventanaFoliar = proximas.find(
    (h) => h.w >= 200 && h.w <= 500 && h.t < 29 && h.lluvia < 0.2,
  );

  const contraste = dias.find((d) => d.calorSinLuz) || null;
  const diaMasCaliente = [...dias].sort((a, b) => b.tMax - a.tMax)[0];
  const diaMasRadiacion = [...dias].sort((a, b) => b.radiacionMj - a.radiacionMj)[0];

  return {
    estacion: TINGO,
    fuentePrecipitacion:
      "Precipitación y temperatura de la zona Tingo María (Huánuco), alineada a lo que reporta SENAMHI en estación. La radiación solar no la da el termómetro de la caseta: se estima por satélite porque calor no es luz.",
    fuenteRadiacion: "Radiación de onda corta (MJ/m² y W/m²). Eso es lo que llena grano y mazorca.",
    dias,
    lluvia7: Math.round(lluvia7 * 10) / 10,
    lluvia48: Math.round(lluvia48 * 10) / 10,
    lluvia6h: Math.round(lluvia6h * 10) / 10,
    ventanaFoliar: ventanaFoliar
      ? {
          hora: ventanaFoliar.hora,
          t: ventanaFoliar.t,
          w: ventanaFoliar.w,
        }
      : null,
    contraste,
    diaMasCaliente: diaMasCaliente
      ? { fecha: diaMasCaliente.fecha, tMax: diaMasCaliente.tMax, radiacionMj: diaMasCaliente.radiacionMj }
      : null,
    diaMasRadiacion: diaMasRadiacion
      ? { fecha: diaMasRadiacion.fecha, tMax: diaMasRadiacion.tMax, radiacionMj: diaMasRadiacion.radiacionMj }
      : null,
  };
}
