import { Link } from "react-router-dom";
import { Camera, Loader, ScanSearch } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import { CULTIVOS, type CultivoId, type HallazgoIa } from "../data/agronomiaCampo";
import { useLotes } from "../hooks/useLotes";
import { useAuth } from "../state/AuthContext";

export function CamaraPage() {
  const { user } = useAuth();
  const { lotes, reload } = useLotes();
  const lote = lotes[0];
  const inputRef = useRef<HTMLInputElement>(null);
  const [cultivo, setCultivo] = useState<CultivoId>("cacao");
  const [preview, setPreview] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [hallazgo, setHallazgo] = useState<HallazgoIa | null>(null);
  const [error, setError] = useState("");
  const [guardada, setGuardada] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la foto");
    } finally {
      setAnalizando(false);
    }
  }

  const sinMatch = hallazgo?.match === "ninguno";

  return (
    <AppShell
      eyebrow="Agricultor · visión de campo"
      title="La cámara compara contra el catálogo"
      subtitle={`${user?.nombre}: no adivina. Mide parecido visual con las fotos etiquetadas (enfermedad o plaga) y trae causa + tratamiento.`}
    >
      <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/30 p-5">
        <p className="text-sm text-amber-100">
          Sube una foto de hoja, mazorca o insecto. Si no se parece a ninguna
          ficha, el sistema dice que no hay coincidencia — no inventa monilia.
          El dataset está en{" "}
          <Link to="/agricultor/catalogo" className="underline underline-offset-4">
            Catálogo
          </Link>
          .
        </p>
      </div>

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
          {error ? <p className="mt-3 text-sm text-amber-200">{error}</p> : null}
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

          {hallazgo ? (
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
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Causa
                </p>
                <p className="mt-1 text-sm text-stone-200">{hallazgo.causa}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Tratamiento
                </p>
                <p className="mt-2 text-sm text-stone-300">{hallazgo.tratamiento}</p>
                <p className="mt-2 text-sm text-amber-200">{hallazgo.aviso}</p>
              </div>
              {guardada ? (
                <p className="rounded-full bg-emerald-500/15 px-4 py-2 text-center text-sm text-emerald-200">
                  Guardada en el lote. El acopio la ve con causa y tratamiento.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
