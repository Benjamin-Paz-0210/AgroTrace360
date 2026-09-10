import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { AppShell, SemaforoPill } from "../components/AppShell";
import { Banner } from "../components/Banner";
import { BitacoraTimeline } from "../components/BitacoraTimeline";
import { FotoViewer, FotosLoteGrid } from "../components/FotoViewer";
import { ProcessStepper } from "../components/ProcessStepper";
import { TIPO_LABEL, type BitacoraTipo } from "../data/mock";
import { DIAS_SIN_FOTO } from "../data/agronomiaCampo";
import { useLotes } from "../hooks/useLotes";
import { useAuth } from "../state/AuthContext";
import { useNotice } from "../state/NoticeContext";

const TIPOS = Object.keys(TIPO_LABEL) as BitacoraTipo[];

export function AgricultorPage() {
  const { user } = useAuth();
  const { confirmar, toast } = useNotice();
  const { lotes, loading, error, reload } = useLotes();
  const lote = lotes[0];
  const [tipo, setTipo] = useState<BitacoraTipo>("nutricion");
  const [titulo, setTitulo] = useState("");
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [vista, setVista] = useState<string | null>(null);

  async function borrarFoto(fotoId: string) {
    if (!lote) return;
    const ok = await confirmar({
      titulo: "Borrar foto del lote",
      texto: "Se quita de la bitácora y el acopio ya no la verá. El catálogo no se toca.",
      ok: "Borrar",
      cancelar: "Conservar",
      peligro: true,
    });
    if (!ok) return;
    setBorrando(fotoId);
    try {
      await api(`/api/lotes/${lote.id}/fotos/${fotoId}`, { method: "DELETE" });
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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!titulo.trim() || !lote) return;
    setSaving(true);
    try {
      await api(`/api/lotes/${lote.id}/bitacora`, {
        method: "POST",
        body: JSON.stringify({
          tipo,
          titulo: titulo.trim(),
          nota: nota.trim() || "Registro de campo.",
        }),
      });
      setTitulo("");
      setNota("");
      reload();
      toast({ tipo: "ok", titulo: "Bitácora actualizada", texto: "El acopio ya puede ver este registro." });
    } catch (err) {
      toast({
        tipo: "error",
        titulo: "No se pudo guardar",
        texto: err instanceof Error ? err.message : "Inténtalo de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell eyebrow="Rol agricultor" title="Mi bitácora de parcela">
        <p className="text-stone-400">Cargando tu lote desde la base de datos…</p>
      </AppShell>
    );
  }

  if (error || !lote) {
    return (
      <AppShell eyebrow="Rol agricultor" title="Mi bitácora de parcela">
        <Banner tipo="error">{error || "No hay lote asignado a esta cuenta."}</Banner>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Rol agricultor"
      title="Mi bitácora de parcela"
      subtitle={`${user?.nombre} solo ve su lote. Las fotos que subas quedan guardadas para el acopio.`}
    >
      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-3xl border border-white/8 bg-white/3 p-5">
        <div>
          <p className="font-mono text-xs text-emerald-400">{lote.id}</p>
          <h2 className="font-serif text-2xl text-white">
            {lote.variedad} · {lote.sistema}
          </h2>
          <p className="mt-3 text-sm text-stone-400">
            {lote.parcela} · {lote.plantasHa} pl/ha
          </p>
          <Link
            to="/agricultor/densidad"
            className="mt-2 inline-block text-xs text-emerald-300 hover:underline"
          >
            Verificar si esa densidad está en el punto →
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <SemaforoPill value={lote.semaforo} />
          <p className="text-sm text-stone-400">
            Calidad {lote.calidadExportPct}%
          </p>
        </div>
      </div>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
        Proceso paso a paso
      </h3>
      <ProcessStepper pasos={lote.pasos} />

      <Banner tipo="info" className="mt-6">
        <p>
          ¿Qué pasa si no registras la maleza? Nada se escribe, y se puede
          perder hasta el 70%. Por eso el sistema no espera el nombre: exige
          foto. Llevas {DIAS_SIN_FOTO} días sin monitoreo visual.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            to="/agricultor/camara"
            className="font-semibold underline-offset-4 hover:underline"
          >
            Abrir cámara IA →
          </Link>
          <Link
            to="/agricultor/suelo"
            className="font-semibold text-emerald-300 underline-offset-4 hover:underline"
          >
            Ver sensores de suelo →
          </Link>
          <Link
            to="/agricultor/guias"
            className="font-semibold text-sky-200 underline-offset-4 hover:underline"
          >
            Clima SENAMHI y foliar →
          </Link>
          <Link
            to="/agricultor/densidad"
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            Densidad pl/ha →
          </Link>
        </div>
      </Banner>

      {lote.fotos?.length ? (
        <>
          <FotosLoteGrid
            fotos={lote.fotos}
            onAbrir={setVista}
            onBorrar={(id) => void borrarFoto(id)}
            borrando={borrando}
            galeriaTo="/agricultor/galeria"
          />
          {vista ? (
            <FotoViewer
              key={vista}
              fotos={lote.fotos}
              inicialId={vista}
              onClose={() => setVista(null)}
              onBorrar={(id) => void borrarFoto(id)}
              borrando={borrando}
              galeriaTo="/agricultor/galeria"
            />
          ) : null}
        </>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <h3 className="font-serif text-2xl text-white">Bitácora</h3>
          <p className="mb-5 text-sm text-stone-400">
            Lo que registras aquí lo ve el técnico de acopio y viaja en el
            pasaporte de la exportadora.
          </p>
          <BitacoraTimeline entries={lote.bitacora} />
        </section>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-6"
        >
          <h3 className="font-serif text-2xl text-white">Nuevo registro</h3>
          <label className="mt-4 block text-xs text-stone-400">
            Tipo
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as BitacoraTipo)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
            >
              {TIPOS.map((item) => (
                <option key={item} value={item}>
                  {TIPO_LABEL[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-xs text-stone-400">
            Título
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Abono de llenado"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="mt-3 block text-xs text-stone-400">
            Nota de campo
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-emerald-950 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar en bitácora"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
