import { useEffect, useState } from "react";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import { CULTIVOS, type CultivoId } from "../data/agronomiaCampo";
import { useAuth } from "../state/AuthContext";

type Ficha = {
  id: string;
  cultivo: string;
  tipo: "enfermedad" | "plaga" | "sano";
  nombre: string;
  nombreCientifico: string;
  causa: string;
  sintoma: string;
  tratamiento: string;
  aviso: string;
  calidadPlanta: number;
  url: string;
};

const TIPOS = [
  { id: "", label: "Todos" },
  { id: "enfermedad", label: "Enfermedad" },
  { id: "plaga", label: "Plaga" },
  { id: "sano", label: "Sano" },
];

const TIPO_COLOR: Record<string, string> = {
  enfermedad: "bg-amber-500/20 text-amber-200",
  plaga: "bg-red-500/20 text-red-200",
  sano: "bg-emerald-500/20 text-emerald-200",
};

export function CatalogoPage() {
  const { user } = useAuth();
  const [cultivo, setCultivo] = useState<CultivoId | "">("");
  const [tipo, setTipo] = useState("");
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vivo = true;
    setLoading(true);
    setError("");
    const q = new URLSearchParams();
    if (cultivo) q.set("cultivo", cultivo);
    if (tipo) q.set("tipo", tipo);
    const suffix = q.toString() ? `?${q}` : "";
    api<Ficha[]>(`/api/catalogo/enfermedades${suffix}`)
      .then((data) => {
        if (vivo) setFichas(data);
      })
      .catch((err: Error) => {
        if (vivo) {
          setFichas([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (vivo) setLoading(false);
      });
    return () => {
      vivo = false;
    };
  }, [cultivo, tipo]);

  return (
    <AppShell
      eyebrow={user?.role === "acopio" ? "Acopio · dataset" : "Agricultor · dataset"}
      title="Catálogo de fotos: enfermedad y plaga"
      subtitle="Causa y tratamiento de cada ficha. La cámara IA compara tu foto de campo contra estas imágenes."
    >
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="text-xs text-stone-400">
          Cultivo
          <select
            value={cultivo}
            onChange={(e) => setCultivo(e.target.value as CultivoId | "")}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white sm:min-w-44"
          >
            <option value="">Todos</option>
            {CULTIVOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-stone-400">
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white sm:min-w-44"
          >
            {TIPOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-stone-500">{fichas.length} fichas en la base</p>
      </div>

      {error ? (
        <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-sm text-amber-100">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-stone-400">Cargando catálogo…</p>
      ) : fichas.length === 0 && !error ? (
        <p className="rounded-2xl border border-white/8 p-6 text-stone-400">
          No hay fichas con ese filtro.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {fichas.map((ficha) => (
            <article
              key={ficha.id}
              className="overflow-hidden rounded-3xl border border-white/8 bg-white/3"
            >
              <img src={ficha.url} alt={ficha.nombre} className="h-44 w-full object-cover" />
              <div className="p-4">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TIPO_COLOR[ficha.tipo] ?? "text-stone-400"}`}
                >
                  {ficha.tipo}
                </span>
                <h3 className="mt-2 font-serif text-xl text-white">{ficha.nombre}</h3>
                <p className="text-xs italic text-stone-500">{ficha.nombreCientifico}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Causa
                </p>
                <p className="mt-1 text-sm text-stone-300">{ficha.causa}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Tratamiento
                </p>
                <p className="mt-1 text-sm text-stone-300">{ficha.tratamiento}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
