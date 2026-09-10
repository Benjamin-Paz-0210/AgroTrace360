import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { AppShell, SemaforoPill } from "../components/AppShell";
import { BitacoraTimeline } from "../components/BitacoraTimeline";
import { useFotosAcopio, useLotes, useRanking } from "../hooks/useLotes";

export function AcopioPage() {
  const { ranking, loading, reload: reloadRanking } = useRanking();
  const { lotes, reload } = useLotes();
  const [aviso, setAviso] = useState("");
  const aptos = lotes.filter((lote) => lote.semaforo === "verde").length;
  const seleccionados = lotes.filter((lote) => lote.seleccion === "seleccionado").length;

  async function elegir(loteId: string, seleccion: "seleccionado" | "rechazado") {
    setAviso("");
    try {
      await api(`/api/acopio/lotes/${loteId}/seleccion`, {
        method: "POST",
        body: JSON.stringify({ seleccion }),
      });
      reload();
      reloadRanking();
    } catch (err) {
      setAviso(err instanceof Error ? err.message : "No se pudo seleccionar");
    }
  }

  return (
    <AppShell
      eyebrow="Rol acopio"
      title="Registro de productores"
      subtitle="Tú eliges qué lote entra. Los deficientes (carencia o bloqueo) ya no se reciben."
    >
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Kpi n={String(lotes.length)} l="Productores registrados" />
        <Kpi n={String(aptos)} l="Aptos (semáforo verde)" />
        <Kpi n={String(seleccionados)} l="Seleccionados para exportadora" />
      </div>
      {aviso ? <p className="mb-4 text-sm text-amber-200">{aviso}</p> : null}

      <div className="overflow-x-auto rounded-3xl border border-white/8">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/4 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Productor</th>
              <th className="px-4 py-3">Lote</th>
              <th className="px-4 py-3">Calidad</th>
              <th className="px-4 py-3">Inocuidad</th>
              <th className="px-4 py-3">Decisión</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-stone-500" colSpan={5}>
                  Leyendo productores…
                </td>
              </tr>
            ) : (
              ranking.map((fila) => {
                const lote = lotes.find((l) => l.id === fila.loteId);
                const deficiente = fila.semaforo !== "verde";
                return (
                  <tr key={fila.loteId} className="border-t border-white/5">
                    <td className="px-4 py-3">
                      <Link
                        to={`/acopio/${fila.productorId}`}
                        className="font-medium text-white hover:text-emerald-300"
                      >
                        {fila.productor}
                      </Link>
                      <p className="text-xs text-stone-500">{fila.variedad}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      {fila.loteId}
                    </td>
                    <td className="px-4 py-3">{fila.calidadExportPct}%</td>
                    <td className="px-4 py-3">
                      <SemaforoPill value={fila.semaforo} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="mb-2 text-xs uppercase tracking-wider text-stone-500">
                        {lote?.seleccion || fila.seleccion || "pendiente"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={deficiente}
                          onClick={() => elegir(fila.loteId, "seleccionado")}
                          className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Seleccionar
                        </button>
                        <button
                          type="button"
                          onClick={() => elegir(fila.loteId, "rechazado")}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs text-stone-300"
                        >
                          Rechazar
                        </button>
                      </div>
                      {deficiente ? (
                        <p className="mt-1 text-[11px] text-amber-200">
                          Deficiente: no se recibe.
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

export function AcopioFotosPage() {
  const { fotos, loading } = useFotosAcopio();

  return (
    <AppShell
      eyebrow="Acopio · evidencia de campo"
      title="Fotos que subieron los agricultores"
      subtitle="Evidencia de enfermedad o plaga. Tú decides si el lote se selecciona."
    >
      {loading ? (
        <p className="text-stone-400">Cargando galería…</p>
      ) : fotos.length === 0 ? (
        <p className="rounded-2xl border border-white/8 p-6 text-stone-400">
          Todavía no hay fotos de tus productores.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {fotos.map((foto) => (
            <article
              key={foto.id}
              className="overflow-hidden rounded-3xl border border-white/8 bg-white/3"
            >
              <img src={foto.url} alt={foto.enfermedad} className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs text-emerald-400">
                  {foto.productor} · {foto.variedad}
                </p>
                <h3 className="mt-1 font-medium text-white">{foto.enfermedad}</h3>
                {foto.causa ? <p className="mt-2 text-sm text-stone-400">{foto.causa}</p> : null}
                <p className="mt-2 text-sm text-stone-400">{foto.tratamiento}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export function AcopioProductorPage({ productorId }: { productorId: string }) {
  const { lotes, loading } = useLotes();
  const lote = lotes.find((item) => item.productorId === productorId);

  return (
    <AppShell
      eyebrow="Acopio · ficha de productor"
      title={lote?.productor ?? "Productor"}
      subtitle={lote?.parcela}
    >
      {loading ? (
        <p className="text-stone-400">Cargando ficha…</p>
      ) : lote ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-white">{lote.id}</h3>
              <SemaforoPill value={lote.semaforo} />
            </div>
            <p className="text-sm text-stone-400">
              {lote.variedad} · calidad {lote.calidadExportPct}% · {lote.seleccion}
            </p>
            {lote.semaforo !== "verde" ? (
              <p className="mt-4 rounded-xl bg-amber-500/15 p-3 text-sm text-amber-200">
                Deficiente. Este acopio ya no recibe lotes en carencia. Rechazar.
              </p>
            ) : (
              <p className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">
                Apto: puedes seleccionarlo para la exportadora.
              </p>
            )}
          </section>
          <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
            <h3 className="mb-4 font-serif text-2xl text-white">Bitácora</h3>
            <BitacoraTimeline entries={lote.bitacora} />
          </section>
        </div>
      ) : (
        <p>Sin lotes.</p>
      )}
    </AppShell>
  );
}

function Kpi({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
      <p className="font-serif text-3xl text-white">{n}</p>
      <p className="text-sm text-stone-400">{l}</p>
    </div>
  );
}
