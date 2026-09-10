import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import {
  CULTIVOS,
  SENSORES_TINGO,
  evaluarSuelo,
  type CultivoId,
} from "../data/agronomiaCampo";
import {
  ZONAS,
  aplicarFactores,
  desdeConteo,
  desdeEspaciamiento,
  plantasPorHa,
  variedadesDe,
  veredicto,
  type Marco,
} from "../data/densidadCampo";
import { Banner } from "../components/Banner";
import { useLotes } from "../hooks/useLotes";
import { useNotice } from "../state/NoticeContext";

function cultivarDeLote(raw: string): CultivoId | null {
  const c = raw.toLowerCase();
  if (c.includes("cacao")) return "cacao";
  if (c.includes("maiz") || c.includes("maíz")) return "maiz";
  if (c.includes("cafe") || c.includes("café")) return "cafe";
  if (c.includes("platano") || c.includes("plátano")) return "platano";
  return null;
}

function MarcoSvg({ marco, denso }: { marco: Marco; denso: boolean }) {
  const gap = denso ? 18 : 28;
  const rows = 5;
  const cols = 6;
  const dots: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r += 1) {
    const offset = marco === "tresbolillo" && r % 2 === 1 ? gap / 2 : 0;
    for (let c = 0; c < cols; c += 1) {
      dots.push({ x: 20 + c * gap + offset, y: 18 + r * gap * 0.86 });
    }
  }
  return (
    <svg viewBox="0 0 200 140" className="h-36 w-full">
      {dots.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill={denso ? "#f59e0b" : "#34d399"} />
      ))}
    </svg>
  );
}

export function DensidadPage() {
  const { toast } = useNotice();
  const { lotes } = useLotes();
  const lote = lotes[0];
  const [cultivo, setCultivo] = useState<CultivoId>("maiz");
  const variedades = variedadesDe(cultivo);
  const [variedadId, setVariedadId] = useState(variedades[0]?.id ?? "inia-hibrido");
  const variedad =
    variedades.find((item) => item.id === variedadId) ?? variedades[0];
  const [zonaId, setZonaId] = useState("tingo");
  const zona = ZONAS.find((item) => item.id === zonaId) ?? ZONAS[0];
  const suelo = useMemo(
    () => evaluarSuelo(cultivo, SENSORES_TINGO),
    [cultivo],
  );
  const [areaHa, setAreaHa] = useState(lote?.areaHa || 1);
  const [modo, setModo] = useState<"conteo" | "marco" | "lote">("conteo");
  const [ladoM, setLadoM] = useState(10);
  const [plantasCuadro, setPlantasCuadro] = useState(50);
  const [medSurco, setMedSurco] = useState(variedad?.entreSurco ?? 0.8);
  const [medPlanta, setMedPlanta] = useState(variedad?.entrePlanta ?? 0.25);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const base = variedad
    ? plantasPorHa(variedad.entreSurco, variedad.entrePlanta, variedad.marco)
    : 0;
  const ideal = aplicarFactores(base, zona.factor, suelo.apto);
  const total = Math.round(ideal * areaHa);

  const actual =
    modo === "lote"
      ? lote?.plantasHa ?? 0
      : modo === "marco"
        ? desdeEspaciamiento(medSurco, medPlanta, variedad?.marco ?? "rectangular")
        : desdeConteo(plantasCuadro, ladoM);
  const fallo = veredicto(actual, ideal);

  function onCultivo(next: CultivoId) {
    setCultivo(next);
    const first = variedadesDe(next)[0];
    if (first) {
      setVariedadId(first.id);
      setMedSurco(first.entreSurco);
      setMedPlanta(first.entrePlanta);
    }
  }

  async function guardarBitacora() {
    if (!lote) return;
    setAviso(null);
    try {
      await api(`/api/lotes/${lote.id}/bitacora`, {
        method: "POST",
        body: JSON.stringify({
          tipo: "densidad",
          titulo: `${fallo.titulo} · ${actual.toLocaleString("es-PE")} pl/ha`,
          nota: `${cultivo} ${variedad?.nombre}. Ideal ${ideal.toLocaleString("es-PE")} pl/ha (${variedad?.entreSurco}×${variedad?.entrePlanta} m, ${variedad?.marco}). Medido ${actual.toLocaleString("es-PE")}. ${fallo.texto}`,
        }),
      });
      setAviso({ tipo: "ok", texto: "Quedó en tu bitácora. El acopio lo ve." });
      toast({ tipo: "ok", titulo: "Verificación guardada", texto: "El acopio ya puede verla." });
    } catch (err) {
      const texto = err instanceof Error ? err.message : "No se pudo guardar";
      setAviso({ tipo: "error", texto });
      toast({ tipo: "error", titulo: "No se pudo guardar", texto });
    }
  }

  const foto =
    cultivo === "maiz" ? "/uploads/guias/dens-maiz.jpg" : "/uploads/guias/dens-cacao.jpg";

  return (
    <AppShell
      eyebrow="Agricultor · reto 2"
      title="¿Cuántas plantas por hectárea?"
      subtitle="El punto correcto cambia con el cultivo, la variedad y tu zona. No es costumbre: es marco × suelo × ladera."
    >
      <div className="mb-6 overflow-hidden rounded-3xl border border-white/8">
        <img src={foto} alt="Marco de siembra" className="h-48 w-full object-cover" />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-stone-400">
          Cultivo
          <select
            value={cultivo}
            onChange={(e) => onCultivo(e.target.value as CultivoId)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
          >
            {CULTIVOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-stone-400">
          Variedad / clon
          <select
            value={variedad?.id}
            onChange={(e) => {
              const v = variedades.find((item) => item.id === e.target.value);
              setVariedadId(e.target.value);
              if (v) {
                setMedSurco(v.entreSurco);
                setMedPlanta(v.entrePlanta);
              }
            }}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
          >
            {variedades.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-stone-400">
          Zona
          <select
            value={zonaId}
            onChange={(e) => setZonaId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
          >
            {ZONAS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-stone-400">
          Área de tu parcela (ha)
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={areaHa}
            onChange={(e) => setAreaHa(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <p className="mb-6 text-sm text-stone-400">
        {variedad?.nota} {zona.nota} Suelo de tus 12 sensores:{" "}
        {suelo.apto ? "apto (factor 1,0)." : "aún no apto (bajamos 10 % la densidad hasta corregir pH/MO)."}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-emerald-500/25 bg-emerald-950/20 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-400">
            Punto correcto
          </p>
          <p className="mt-2 font-serif text-4xl text-white sm:text-5xl">
            {ideal.toLocaleString("es-PE")}
            <span className="ml-2 text-lg text-stone-400">pl/ha</span>
          </p>
          <p className="mt-2 text-sm text-stone-300">
            Marco {variedad?.entreSurco} × {variedad?.entrePlanta} m · {variedad?.marco}
            {suelo.apto ? "" : " · −10 % por suelo"}
            {zona.factor !== 1 ? ` · ×${zona.factor} zona` : ""}
          </p>
          <p className="mt-4 text-sm text-white">
            En {areaHa} ha necesitas{" "}
            <b>{total.toLocaleString("es-PE")} plantas</b>
            {cultivo === "maiz"
              ? " (siembra ~10 % más de semilla por germinación)."
              : " de vivero certificado."}
          </p>
          <Link
            to="/agricultor/tienda"
            className="mt-4 inline-block text-sm text-emerald-300 underline-offset-4 hover:underline"
          >
            Pedir semilla / plantón certificado →
          </Link>
          <div className="mt-4 rounded-2xl bg-black/30 p-2">
            <MarcoSvg marco={variedad?.marco ?? "rectangular"} denso={false} />
            <p className="px-2 pb-2 text-[11px] text-stone-500">
              Trazo {variedad?.marco === "tresbolillo" ? "tresbolillo (triángulo)" : "en surcos"}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
            Verificar el terreno
          </p>
          <h3 className="mt-1 font-serif text-2xl text-white">
            ¿Está en el punto?
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["conteo", "Contar en un cuadro"],
                ["marco", "Medir surco y planta"],
                ["lote", "Usar mi lote"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setModo(id);
                  if (id === "lote" && lote) {
                    const c = cultivarDeLote(lote.cultivo);
                    if (c) onCultivo(c);
                  }
                }}
                className={`rounded-full px-3 py-1 text-xs ${
                  modo === id
                    ? "bg-amber-500 text-stone-950"
                    : "border border-white/15 text-stone-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {modo === "conteo" ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs text-stone-400">
                Lado del cuadro (m)
                <input
                  type="number"
                  min={5}
                  value={ladoM}
                  onChange={(e) => setLadoM(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-stone-400">
                Plantas contadas
                <input
                  type="number"
                  min={0}
                  value={plantasCuadro}
                  onChange={(e) => setPlantasCuadro(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
                />
              </label>
              <p className="col-span-2 text-[11px] text-stone-500">
                Estaca un cuadro de {ladoM}×{ladoM} m. En el punto correcto contarías
                unas {Math.round((ideal * ladoM * ladoM) / 10000)} plantas.
              </p>
            </div>
          ) : null}

          {modo === "marco" ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs text-stone-400">
                Entre surcos (m)
                <input
                  type="number"
                  min={0.1}
                  step={0.05}
                  value={medSurco}
                  onChange={(e) => setMedSurco(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-stone-400">
                Entre plantas (m)
                <input
                  type="number"
                  min={0.1}
                  step={0.05}
                  value={medPlanta}
                  onChange={(e) => setMedPlanta(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
          ) : null}

          {modo === "lote" ? (
            <p className="mt-4 text-sm text-stone-300">
              {lote
                ? `${lote.id} · ${lote.variedad} · ${lote.plantasHa.toLocaleString("es-PE")} pl/ha registradas · ${lote.sistema}`
                : "Entra como agricultor para leer tu lote."}
            </p>
          ) : null}

          <p
            className={`mt-5 rounded-2xl p-4 text-sm ${
              fallo.tipo === "punto"
                ? "bg-emerald-500/15 text-emerald-100"
                : "bg-amber-500/15 text-amber-100"
            }`}
          >
            <b className="block font-serif text-xl text-white">
              {actual.toLocaleString("es-PE")} pl/ha
            </b>
            {fallo.titulo}. {fallo.texto}
          </p>
          <div className="mt-3 rounded-2xl bg-black/30 p-2">
            <MarcoSvg
              marco={variedad?.marco ?? "rectangular"}
              denso={fallo.tipo === "junto"}
            />
          </div>
          {lote ? (
            <button
              type="button"
              onClick={guardarBitacora}
              className="mt-4 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950"
            >
              Guardar verificación en bitácora
            </button>
          ) : null}
          {aviso ? (
            <Banner tipo={aviso.tipo} className="mt-4 mb-0!">
              {aviso.texto}
            </Banner>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
