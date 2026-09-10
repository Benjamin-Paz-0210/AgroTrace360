import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Banner } from "../components/Banner";
import {
  CULTIVOS,
  SENSORES_TINGO,
  evaluarSuelo,
  type CultivoId,
} from "../data/agronomiaCampo";

function tonoPh(ph: number) {
  if (ph < 5.3) return "bg-red-500";
  if (ph < 6) return "bg-amber-400";
  return "bg-emerald-500";
}

export function SueloPage() {
  const [cultivo, setCultivo] = useState<CultivoId>("cacao");
  const resultado = useMemo(
    () => evaluarSuelo(cultivo, SENSORES_TINGO),
    [cultivo],
  );
  const { avg, req, fallas, apto, plan } = resultado;

  return (
    <AppShell
      eyebrow="Agricultor · suelo en tiempo real"
      title="Sensores donde iba la calicata"
      subtitle="No se saca una muestra en otra ladera y se finge que es toda la parcela. El sensor queda en cada punto de muestreo y lee pH, humedad y nutrientes en el lugar real."
    >
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="text-xs text-stone-400">
          Tipo de planta
          <select
            value={cultivo}
            onChange={(e) => setCultivo(e.target.value as CultivoId)}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white sm:min-w-56"
          >
            {CULTIVOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
        <p
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            apto
              ? "bg-emerald-600 text-white"
              : "bg-amber-500 text-stone-950"
          }`}
        >
          {apto
            ? "Suelo apto para este cultivo"
            : "Suelo no apto todavía — ver plan orgánico"}
        </p>
      </div>

      <p className="mb-4 text-sm text-stone-400">{req.nota}</p>
      {cultivo === "maiz" ? (
        <Banner tipo="info">
          Charla de maíz: zinc foliar en V4–V6, siembra con lluvia SENAMHI y
          surcos al Este. El calor de la tarde no llena grano.{" "}
          <Link to="/agricultor/guias" className="font-semibold underline-offset-4 hover:underline">
            Abrir clima y foliar →
          </Link>
        </Banner>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <h3 className="font-serif text-2xl text-white">
            Malla de 12 sensores
          </h3>
          <p className="mt-1 mb-4 text-xs text-stone-400">
            Cada celda es el punto donde antes se sacaba la muestra. Color según
            pH. Los valores se refrescan en parcela, no en laboratorio de otra
            zona.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SENSORES_TINGO.map((punto) => (
              <div
                key={punto.id}
                className="rounded-xl border border-white/10 bg-black/30 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-stone-400">
                    {punto.etiqueta}
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${tonoPh(punto.ph)}`}
                  />
                </div>
                <p className="text-sm text-white">pH {punto.ph.toFixed(1)}</p>
                <p className="text-[11px] text-stone-500">
                  H {punto.humedadPct}% · MO {punto.moPct}%
                </p>
              </div>
            ))}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-2 text-xs text-stone-400 sm:grid-cols-4">
            <div>
              pH medio <b className="block text-white">{avg.ph.toFixed(2)}</b>
            </div>
            <div>
              MO <b className="block text-white">{avg.moPct.toFixed(1)}%</b>
            </div>
            <div>
              N-P-K{" "}
              <b className="block text-white">
                {avg.n.toFixed(0)}-{avg.p.toFixed(0)}-{avg.k.toFixed(0)}
              </b>
            </div>
            <div>
              B / Zn{" "}
              <b className="block text-white">
                {avg.boro.toFixed(2)} / {avg.zinc.toFixed(2)}
              </b>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <h3 className="font-serif text-2xl text-white">
            {apto ? "Mantener" : "Corregir con abono orgánico"}
          </h3>
          {fallas.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-amber-200">
              {fallas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-200">
              Los 12 puntos están dentro del rango de {cultivo}.
            </p>
          )}
          <ol className="mt-5 space-y-3">
            {plan.map((fase) => (
              <li
                key={`${fase.semanaInicio}-${fase.semanaFin}`}
                className="rounded-xl border border-white/10 bg-black/25 p-4"
              >
                <p className="font-mono text-[11px] text-emerald-400">
                  Semanas {fase.semanaInicio}–{fase.semanaFin}
                </p>
                <p className="mt-1 text-sm text-stone-200">{fase.accion}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
