import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { api } from "../api/client";
import { AppShell, SemaforoPill } from "../components/AppShell";
import { BitacoraTimeline } from "../components/BitacoraTimeline";
import { useFotosAcopio, useLotes, useRanking } from "../hooks/useLotes";
import { Banner } from "../components/Banner";
import { FotoViewer } from "../components/FotoViewer";
import { ImgLote } from "../components/ImgLote";
import { useNotice } from "../state/NoticeContext";

export function AcopioPage() {
  const { toast } = useNotice();
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
      toast({
        tipo: "ok",
        titulo: seleccion === "seleccionado" ? "Lote seleccionado" : "Lote rechazado",
        texto: seleccion === "seleccionado"
          ? "Pasa a la exportadora."
          : "No entra al contenedor.",
      });
    } catch (err) {
      setAviso(err instanceof Error ? err.message : "No se pudo seleccionar");
      toast({
        tipo: "error",
        titulo: "No se pudo decidir",
        texto: err instanceof Error ? err.message : "Inténtalo de nuevo.",
      });
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
      {aviso ? <Banner tipo="error">{aviso}</Banner> : null}

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
  const { confirmar, toast } = useNotice();
  const { fotos, loading, reload } = useFotosAcopio();
  const [borrando, setBorrando] = useState<string | null>(null);
  const [vista, setVista] = useState<string | null>(null);

  async function borrarFoto(loteId: string, fotoId: string) {
    const ok = await confirmar({
      titulo: "Borrar foto del lote",
      texto: "Se quita de la evidencia de campo de este productor.",
      ok: "Borrar",
      cancelar: "Conservar",
      peligro: true,
    });
    if (!ok) return;
    setBorrando(fotoId);
    try {
      await api(`/api/lotes/${loteId}/fotos/${fotoId}`, { method: "DELETE" });
      reload();
      toast({ tipo: "ok", titulo: "Foto borrada", texto: "Ya no está en el lote." });
    } catch (err) {
      toast({
        tipo: "error",
        titulo: "No se pudo borrar",
        texto: err instanceof Error ? err.message : "Inténtalo de nuevo.",
      });
    } finally {
      setBorrando(null);
    }
  }

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
              <button type="button" onClick={() => setVista(foto.id)} className="block w-full">
                <ImgLote src={foto.url} fallbackSrc={foto.fotoCatalogo} alt="" className="h-48 w-full object-cover" />
              </button>
              <div className="p-4">
                <p className="text-xs text-emerald-400">
                  {foto.productor} · {foto.variedad}
                </p>
                <button
                  type="button"
                  onClick={() => setVista(foto.id)}
                  className="mt-1 text-left font-medium text-white hover:underline"
                >
                  {foto.enfermedad}
                </button>
                {foto.causa ? <p className="mt-2 text-sm text-stone-400">{foto.causa}</p> : null}
                <p className="mt-2 text-sm text-stone-400">{foto.tratamiento}</p>
                <button
                  type="button"
                  disabled={borrando === foto.id}
                  onClick={() => void borrarFoto(foto.loteId, foto.id)}
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-stone-300 hover:border-red-400/50 hover:text-red-200 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {borrando === foto.id ? "Borrando…" : "Borrar del lote"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {vista ? (
        <FotoViewer
          key={vista}
          fotos={fotos}
          inicialId={vista}
          onClose={() => setVista(null)}
          onBorrar={(id) => {
            const f = fotos.find((x) => x.id === id);
            if (f) void borrarFoto(f.loteId, f.id);
          }}
          borrando={borrando}
        />
      ) : null}
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
