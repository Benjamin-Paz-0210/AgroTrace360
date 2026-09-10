import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Images, Trash2, X } from "lucide-react";
import type { FotoCampo } from "../data/mock";
import { fotoToHallazgo } from "../lib/fotoIa";
import { HallazgoPanel } from "./HallazgoPanel";
import { ImgLote } from "./ImgLote";

export function FotoViewer({
  fotos,
  inicialId,
  onClose,
  onBorrar,
  borrando,
  galeriaTo,
}: {
  fotos: FotoCampo[];
  inicialId?: string;
  onClose: () => void;
  onBorrar?: (id: string) => void;
  borrando?: string | null;
  galeriaTo?: string;
}) {
  const start = Math.max(
    0,
    inicialId ? fotos.findIndex((f) => f.id === inicialId) : 0,
  );
  const [i, setI] = useState(start < 0 ? 0 : start);
  const touchX = useRef<number | null>(null);
  const foto = fotos[i];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setI((n) => (n - 1 + fotos.length) % fotos.length);
      if (e.key === "ArrowRight") setI((n) => (n + 1) % fotos.length);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [fotos.length, onClose]);

  useEffect(() => {
    if (!fotos.length) onClose();
    else if (i >= fotos.length) setI(Math.max(0, fotos.length - 1));
  }, [fotos.length, i, onClose]);

  if (!foto) return null;

  function ir(delta: number) {
    setI((n) => (n + delta + fotos.length) % fotos.length);
  }

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="notice-backdrop absolute inset-0 bg-[#0a0705]/80 backdrop-blur-md"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="notice-card relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[1.75rem] border border-amber-200/15 bg-[#16110c] shadow-[0_28px_80px_rgba(0,0,0,0.6)] sm:rounded-[1.75rem]">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
          <p className="text-sm text-stone-400">
            {i + 1} / {fotos.length} · {foto.enfermedad}
          </p>
          <div className="flex items-center gap-2">
            {galeriaTo ? (
              <Link
                to={`${galeriaTo}?foto=${foto.id}`}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs text-stone-200 hover:text-white"
              >
                <Images className="h-3.5 w-3.5" />
                Galería
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-stone-300 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className="relative bg-black/40"
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
            <ImgLote src={foto.url} alt={foto.enfermedad} className="max-h-[52vh] w-full object-contain lg:max-h-[70vh]" />
            {fotos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => ir(-1)}
                  className="absolute top-1/2 left-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => ir(1)}
                  className="absolute top-1/2 right-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>
          <div className="p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
              Resultado de la IA
            </p>
            <HallazgoPanel hallazgo={fotoToHallazgo(foto)} />
            {onBorrar ? (
              <button
                type="button"
                disabled={borrando === foto.id}
                onClick={() => void onBorrar(foto.id)}
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs text-stone-300 hover:border-red-400/50 hover:text-red-200 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {borrando === foto.id ? "Borrando…" : "Borrar del lote"}
              </button>
            ) : null}
          </div>
        </div>

        {fotos.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto border-t border-white/8 px-3 py-3">
            {fotos.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setI(idx)}
                className={`h-14 w-16 shrink-0 overflow-hidden rounded-lg border ${
                  idx === i ? "border-amber-300" : "border-white/10 opacity-70"
                }`}
              >
                <ImgLote src={item.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FotosLoteGrid({
  fotos,
  onAbrir,
  onBorrar,
  borrando,
  galeriaTo,
}: {
  fotos: FotoCampo[];
  onAbrir: (id: string) => void;
  onBorrar?: (id: string) => void;
  borrando?: string | null;
  galeriaTo?: string;
}) {
  if (!fotos.length) return null;
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
          Fotos guardadas en tu lote
        </h3>
        {galeriaTo ? (
          <Link
            to={galeriaTo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 underline-offset-4 hover:underline"
          >
            <Images className="h-3.5 w-3.5" />
            Galería de fotos
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {fotos.map((foto) => (
          <figure key={foto.id} className="overflow-hidden rounded-2xl border border-white/8">
            <button
              type="button"
              onClick={() => onAbrir(foto.id)}
              className="block w-full"
            >
              <ImgLote src={foto.url} alt="" className="h-28 w-full object-cover" />
            </button>
            <figcaption className="flex items-start justify-between gap-2 p-2">
              <button
                type="button"
                onClick={() => onAbrir(foto.id)}
                className="min-w-0 text-left text-[11px] text-stone-400 hover:text-white"
              >
                {foto.enfermedad}
              </button>
              {onBorrar ? (
                <button
                  type="button"
                  disabled={borrando === foto.id}
                  onClick={() => void onBorrar(foto.id)}
                  className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-stone-400 hover:border-red-400/50 hover:text-red-200 disabled:opacity-40"
                  aria-label="Borrar foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
