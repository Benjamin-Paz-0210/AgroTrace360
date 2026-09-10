import type { HallazgoIa } from "../data/agronomiaCampo";

export function HallazgoPanel({ hallazgo }: { hallazgo: HallazgoIa }) {
  const sinMatch = hallazgo.match === "ninguno" || hallazgo.tipo === "sin_match";

  return (
    <div className="space-y-4">
      <p
        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
          sinMatch
            ? "bg-stone-700 text-stone-200"
            : hallazgo.tipo === "plaga"
              ? "bg-red-500/20 text-red-200"
              : hallazgo.tipo === "sano"
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-amber-500/20 text-amber-200"
        }`}
      >
        {sinMatch ? "Sin coincidencia" : hallazgo.tipo}
      </p>
      <div>
        <p className="font-serif text-3xl text-white">{hallazgo.enfermedad}</p>
        {hallazgo.nombreCientifico ? (
          <p className="text-xs italic text-stone-500">{hallazgo.nombreCientifico}</p>
        ) : null}
        <p className="mt-1 text-sm text-emerald-300">
          {sinMatch
            ? "Ninguna ficha superó el umbral de parecido"
            : `Parecido ${hallazgo.similitud ?? hallazgo.confianzaEnfermedad}%`}
        </p>
      </div>
      {hallazgo.fotoCatalogo ? (
        <div>
          <p className="text-xs uppercase tracking-wider text-stone-500">
            Ficha del catálogo con la que coincidió
          </p>
          <img
            src={hallazgo.fotoCatalogo}
            alt="Referencia"
            className="mt-2 h-32 w-full rounded-xl object-cover"
          />
        </div>
      ) : null}
      <div className="rounded-xl bg-black/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Causa</p>
        <p className="mt-1 text-sm text-stone-200">{hallazgo.causa}</p>
      </div>
      <div className="rounded-xl border border-emerald-500/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Tratamiento
        </p>
        <p className="mt-2 text-sm text-stone-300">{hallazgo.tratamiento}</p>
        {hallazgo.aviso ? <p className="mt-2 text-sm text-amber-200">{hallazgo.aviso}</p> : null}
      </div>
      {sinMatch ? (
        <p className="rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-stone-400">
          Si el catálogo suma fotos o respuestas nuevas, volvemos a comparar esta imagen y
          actualizamos el resultado.
        </p>
      ) : null}
    </div>
  );
}
