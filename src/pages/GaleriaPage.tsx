import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Banner } from "../components/Banner";
import { HallazgoPanel } from "../components/HallazgoPanel";
import { ImgLote } from "../components/ImgLote";
import type { FotoCampo } from "../data/mock";
import { useLotes } from "../hooks/useLotes";
import { fotoToHallazgo } from "../lib/fotoIa";
import { useAuth } from "../state/AuthContext";
import { useNotice } from "../state/NoticeContext";

export function GaleriaPage() {
  const { user } = useAuth();
  const { toast } = useNotice();
  const { lotes, loading, error, reload } = useLotes();
  const lote = lotes[0];
  const [params] = useSearchParams();
  const fotos = lote?.fotos ?? [];
  const pedido = params.get("foto");
  const start = Math.max(0, pedido ? fotos.findIndex((f) => f.id === pedido) : 0);
  const [i, setI] = useState(start < 0 ? 0 : start);
  const [sync, setSync] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!pedido || !fotos.length) return;
    const idx = fotos.findIndex((f) => f.id === pedido);
    if (idx >= 0) setI(idx);
  }, [pedido, fotos.length]);

  useEffect(() => {
    if (!lote) return;
    let vivo = true;
    setSync(true);
    api<{ actualizadas: number; respuestas: number }>(`/api/lotes/${lote.id}/fotos/actualizar-ia`, {
      method: "POST",
    })
      .then((data) => {
        if (!vivo) return;
        if (data.actualizadas > 0) {
          toast({
            tipo: "ok",
            titulo: "Diagnóstico actualizado",
            texto:
              data.actualizadas === 1
                ? "Una foto que no coincidía ahora sí tiene ficha."
                : `${data.actualizadas} fotos que no coincidían ahora sí tienen ficha.`,
          });
          reload();
        } else if (data.respuestas > 0) {
          toast({
            tipo: "info",
            titulo: "Respuestas al día",
            texto: "Causa y tratamiento se alinearon al catálogo nuevo.",
          });
          reload();
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (vivo) setSync(false);
      });
    return () => {
      vivo = false;
    };
  }, [lote?.id]);

  useEffect(() => {
    if (fotos.length && i >= fotos.length) setI(fotos.length - 1);
  }, [fotos.length, i]);

  const foto: FotoCampo | undefined = fotos[i];

  function ir(delta: number) {
    if (!fotos.length) return;
    setI((n) => (n + delta + fotos.length) % fotos.length);
  }

  if (loading) {
    return (
      <AppShell eyebrow="Agricultor · galería" title="Fotos guardadas">
        <p className="text-stone-400">Cargando tu lote…</p>
      </AppShell>
    );
  }

  if (error || !lote) {
    return (
      <AppShell eyebrow="Agricultor · galería" title="Fotos guardadas">
        <Banner tipo="error">{error || "No hay lote asignado a esta cuenta."}</Banner>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Agricultor · galería"
      title="Fotos guardadas"
      subtitle={`${user?.nombre}: elige una foto para ver qué dijo la IA. Si no coincidió, se vuelve a comparar cuando el catálogo suma fichas.`}
    >
      {sync ? (
        <p className="mb-4 flex items-center gap-2 text-sm text-stone-400">
          <Loader className="h-4 w-4 animate-spin" />
          Comparando de nuevo las que no coincidieron…
        </p>
      ) : null}

      {!fotos.length ? (
        <Banner tipo="info">Todavía no hay fotos en este lote. Ábrelo desde Cámara IA.</Banner>
      ) : foto ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-3xl border border-white/8 bg-white/3">
            <div
              className="relative bg-black/30"
              onTouchStart={(e) => {
                touchX.current = e.changedTouches[0]?.clientX ?? null;
              }}
              onTouchEnd={(e) => {
                const x = e.changedTouches[0]?.clientX;
                if (touchX.current == null || x == null) return;
                const d = x - touchX.current;
                if (d > 40) ir(-1);
                if (d < -40) ir(1);
                touchX.current = null;
              }}
            >
              <ImgLote
                src={foto.url}
                alt={foto.enfermedad}
                className="max-h-[62vh] w-full min-h-64 object-contain"
              />
              {fotos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => ir(-1)}
                    className="absolute top-1/2 left-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => ir(1)}
                    className="absolute top-1/2 right-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
            <div className="flex gap-2 overflow-x-auto p-3">
              {fotos.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setI(idx)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border ${
                    idx === i ? "border-amber-300" : "border-white/10 opacity-70"
                  }`}
                >
                  <ImgLote src={item.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
              Resultado de la IA
            </p>
            <p className="mt-1 mb-5 text-sm text-stone-500">
              Foto {i + 1} de {fotos.length}
            </p>
            <HallazgoPanel hallazgo={fotoToHallazgo(foto)} />
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
