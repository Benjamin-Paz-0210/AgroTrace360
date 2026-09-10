import type { FotoCampo } from "../data/mock";
import type { CultivoId, HallazgoIa } from "../data/agronomiaCampo";

export function esSinMatch(foto: Pick<FotoCampo, "match" | "tipo" | "enfermedad">) {
  return (
    foto.match === "ninguno" ||
    foto.tipo === "sin_match" ||
    /sin coincidencia/i.test(foto.enfermedad || "")
  );
}

export function fotoToHallazgo(foto: FotoCampo): HallazgoIa {
  return {
    id: foto.id,
    cultivo: (foto.cultivo as CultivoId) || "cacao",
    tipo: (foto.tipo as HallazgoIa["tipo"]) || undefined,
    calidadPlantaPct: foto.calidadPlanta,
    enfermedad: foto.enfermedad,
    confianzaEnfermedad: foto.confianzaEnfermedad,
    maleza: foto.maleza,
    confianzaMaleza: foto.confianzaMaleza,
    causa: foto.causa,
    tratamiento: foto.tratamiento,
    aviso: foto.aviso ?? "",
    nombreCientifico: foto.nombreCientifico,
    match: foto.match ?? undefined,
    similitud: foto.similitud ?? foto.confianzaEnfermedad,
    fotoCatalogo: foto.fotoCatalogo,
  };
}
