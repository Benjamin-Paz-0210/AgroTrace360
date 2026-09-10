import { Link } from "react-router-dom";
import { Camera, Loader, ScanSearch } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Banner } from "../components/Banner";
import { FotoViewer, FotosLoteGrid } from "../components/FotoViewer";
import { HallazgoPanel } from "../components/HallazgoPanel";
import { CULTIVOS, type CultivoId, type HallazgoIa } from "../data/agronomiaCampo";
import { useLotes } from "../hooks/useLotes";
import { useAuth } from "../state/AuthContext";
import { useNotice } from "../state/NoticeContext";

export function CamaraPage() {
  const { user } = useAuth();
  const { confirmar, toast } = useNotice();
  const { lotes, reload } = useLotes();
  const lote = lotes[0];
  const inputRef = useRef<HTMLInputElement>(null);
  const [cultivo, setCultivo] = useState<CultivoId>("cacao");
  const [preview, setPreview] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [hallazgo, setHallazgo] = useState<HallazgoIa | null>(null);
  const [error, setError] = useState("");
  const [guardada, setGuardada] = useState(false);
  const [borrando, setBorrando] = useState<string | null>(null);
  const [vista, setVista] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file || !lote) return;
    setPreview(URL.createObjectURL(file));
    setHallazgo(null);
    setGuardada(false);
    setError("");
    setAnalizando(true);
    try {
      const body = new FormData();
      body.append("foto", file);
      body.append("cultivo", cultivo);
      const data = await api<{ hallazgo: HallazgoIa; calidadExportPct: number }>(
        `/api/lotes/${lote.id}/fotos`,
        { method: "POST", body },
      );
      setHallazgo({
        ...data.hallazgo,
        id: data.hallazgo.id || "ia-live",
        cultivo: data.hallazgo.cultivo || cultivo,
        aviso: data.hallazgo.aviso ?? "",
      });
      setGuardada(true);
      reload();
      toast({
        tipo: "ok",
        titulo: "Foto guardada",
        texto: "El acopio ya puede verla en el lote.",
      });
    } catch (err) {
      const texto = err instanceof Error ? err.message : "No se pudo guardar la foto";
      setError(texto);
      toast({ tipo: "error", titulo: "No se pudo guardar la foto", texto });
    } finally {
      setAnalizando(false);
    }
  }

  async function borrarFoto(fotoId: string) {
    if (!lote) return;
    const ok = await confirmar({
      titulo: "Borrar foto del lote",
      texto: "Se quita de las guardadas. El acopio ya no la verá.",
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

  return (
    <AppShell
      eyebrow="Agricultor · visión de campo"
      title="La cámara compara contra el catálogo"
      subtitle={`${user?.nombre}: no adivina. Mide parecido visual con las fotos etiquetadas (enfermedad o plaga) y trae causa + tratamiento.`}
    >
      <Banner tipo="info">
        Sube una foto de hoja, mazorca o insecto. Si no se parece a ninguna
        ficha, el sistema dice que no hay coincidencia — no inventa monilia.
        El dataset está en{" "}
        <Link to="/agricultor/catalogo" className="font-semibold underline underline-offset-4">
          Catálogo
        </Link>
        .
      </Banner>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <label className="block text-xs text-stone-400">
            Cultivo a comparar
            <select
              value={cultivo}
              onChange={(e) => {
                setCultivo(e.target.value as CultivoId);
                setHallazgo(null);
                setGuardada(false);
              }}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
            >
              {CULTIVOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 flex w-full min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-950/20 px-4 py-10 text-center"
          >
            <Camera className="h-8 w-8 text-emerald-300" />
            <span className="mt-3 font-semibold text-white">
              Tomar o subir foto
            </span>
            <span className="mt-1 text-xs text-stone-400">
              Se compara color y forma contra las fotos de Postgres. El acopio ve el resultado.
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />

          {preview ? (
            <img
              src={preview}
              alt="Foto de campo"
              className="mt-4 h-56 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="mt-4 grid h-56 place-items-center rounded-2xl bg-black/30 text-sm text-stone-500">
              Sin foto todavía
            </div>
          )}
          {error ? (
            <Banner tipo="error" className="mt-4 mb-0!">
              {error}
            </Banner>
          ) : null}
        </section>

        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <div className="mb-4 flex items-center gap-2 text-emerald-300">
            <ScanSearch className="h-5 w-5" />
            <h3 className="font-serif text-2xl text-white">Comparación</h3>
          </div>

          {analizando ? (
            <p className="flex items-center gap-2 text-sm text-stone-300">
              <Loader className="h-4 w-4 animate-spin" />
              Midiendo parecido con las fichas de {cultivo}…
            </p>
          ) : null}

          {!analizando && !hallazgo ? (
            <p className="text-sm text-stone-400">
              La foto se compara contra el catálogo. Sale el tipo (enfermedad o
              plaga), la causa y el tratamiento de la ficha más parecida. Si no
              llega al umbral, no hay diagnóstico.
            </p>
          ) : null}

          {hallazgo ? <HallazgoPanel hallazgo={hallazgo} /> : null}
          {guardada ? (
            <p className="mt-4 rounded-full bg-emerald-500/15 px-4 py-2 text-center text-sm text-emerald-200">
              Guardada en el lote. El acopio la ve con causa y tratamiento.
            </p>
          ) : null}
        </section>
      </div>

      {lote?.fotos?.length ? (
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
    </AppShell>
  );
}
