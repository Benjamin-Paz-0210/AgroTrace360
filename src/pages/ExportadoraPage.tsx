import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { AppShell, SemaforoPill } from "../components/AppShell";
import { BitacoraTimeline } from "../components/BitacoraTimeline";
import { QualityRing } from "../components/QualityRing";
import { TraceMap } from "../components/TraceMap";
import { CERTIFICADORAS, expedienteExport } from "../data/ecosistemaExport";
import { CONTENEDOR, DESTINO, EXPORTADORA, type Lote } from "../data/mock";
import { useLotes } from "../hooks/useLotes";

type AcopioResumen = {
  id: string;
  nombre: string;
  zona: string;
  productores: number;
  seleccionados: number;
  rechazados: number;
  pendientes: number;
  calidadPromedio: number;
};

export function ExportadoraHome() {
  const [acopios, setAcopios] = useState<AcopioResumen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AcopioResumen[]>("/api/exportadora/acopios")
      .then(setAcopios)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      eyebrow="Rol exportadora"
      title="Tus acopios"
      subtitle="Desglosa cada acopio. Solo ves lo seleccionado. El expediente de campo adelanta SENASA y la auditoría (SGS, Control Union)."
    >
      {loading ? (
        <p className="text-stone-400">Cargando acopios…</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {acopios.map((acopio) => (
            <Link
              key={acopio.id}
              to={`/exportadora/acopio/${acopio.id}`}
              className="rounded-3xl border border-white/8 bg-white/3 p-6 hover:border-emerald-500/40"
            >
              <h2 className="font-serif text-2xl text-white">{acopio.nombre}</h2>
              <p className="text-sm text-stone-400">{acopio.zona}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-stone-300">
                <div>
                  Productores <b className="block text-white">{acopio.productores}</b>
                </div>
                <div>
                  Seleccionados <b className="block text-white">{acopio.seleccionados}</b>
                </div>
                <div>
                  Calidad media <b className="block text-white">{acopio.calidadPromedio}%</b>
                </div>
                <div>
                  Pendientes / rechazados{" "}
                  <b className="block text-white">
                    {acopio.pendientes} / {acopio.rechazados}
                  </b>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export function ExportadoraAcopioPage() {
  const { acopioId } = useParams();
  const [nombre, setNombre] = useState("Acopio");
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!acopioId) return;
    api<{ acopio: { nombre: string }; lotes: Lote[] }>(
      `/api/exportadora/acopios/${acopioId}`,
    )
      .then((data) => {
        setNombre(data.acopio.nombre);
        setLotes(data.lotes);
      })
      .finally(() => setLoading(false));
  }, [acopioId]);

  return (
    <AppShell
      eyebrow="Exportadora · desglose"
      title={nombre}
      subtitle="Lo que el acopio ya eligió. Cada lote arrastra bitácora, carencia y evidencia para el inspector."
    >
      <Link to="/exportadora" className="mb-6 inline-block text-xs text-stone-500 hover:text-emerald-300">
        ← Todos los acopios
      </Link>
      {loading ? (
        <p className="text-stone-400">Cargando lotes seleccionados…</p>
      ) : lotes.length === 0 ? (
        <p className="rounded-2xl border border-white/8 p-6 text-stone-400">
          Este acopio aún no selecciona lotes aptos.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lotes.map((lote) => (
            <Link
              key={lote.id}
              to={`/exportadora/lote/${lote.id}`}
              className="rounded-3xl border border-white/8 bg-white/3 p-5 hover:border-emerald-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400">{lote.id}</span>
                <SemaforoPill value={lote.semaforo} />
              </div>
              <p className="mt-2 font-medium text-white">{lote.productor}</p>
              <p className="text-sm text-stone-400">
                {lote.variedad} · {lote.cultivo}
              </p>
              <p className="mt-3 font-serif text-3xl text-white">{lote.calidadExportPct}%</p>
              <p className="text-xs text-stone-500">calidad exportable</p>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export function ExportadoraPage() {
  const { loteId } = useParams();
  const { lotes, loading } = useLotes();
  const lote = lotes.find((item) => item.id === loteId);

  const qr = useMemo(
    () =>
      lote
        ? JSON.stringify({
            exportadora: EXPORTADORA,
            lote: lote.id,
            origen: lote.parcela,
            genetica: lote.variedad,
            calidad: lote.calidadExportPct,
            lmr: lote.semaforo,
            destino: DESTINO,
            contenedor: CONTENEDOR,
          })
        : "",
    [lote],
  );

  const delAcopio = lotes.filter((item) => item.acopioId === lote?.acopioId);
  const promedio =
    Math.round(
      delAcopio.reduce((acc, item) => acc + item.calidadExportPct, 0) /
        (delAcopio.length || 1),
    ) || 0;

  if (loading) {
    return (
      <AppShell eyebrow="Rol exportadora" title="Trazabilidad de origen a destino">
        <p className="text-stone-400">Cargando lote seleccionado…</p>
      </AppShell>
    );
  }

  if (!lote) {
    return (
      <AppShell eyebrow="Rol exportadora" title="Lote no visible">
        <p className="text-stone-400">
          Solo ves lo que el acopio ya seleccionó. Este lote no entra a exportación.
        </p>
        <Link to="/exportadora" className="mt-4 inline-block text-sm text-emerald-300">
          ← Volver a acopios
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Rol exportadora"
      title="Trazabilidad de origen a destino"
      subtitle={`${EXPORTADORA} · contenedor ${CONTENEDOR} · ${DESTINO}`}
    >
      <div className="mb-8 flex flex-wrap gap-4">
        <Link to="/exportadora" className="text-xs text-stone-500 hover:text-emerald-300">
          ← Acopios
        </Link>
        {lote.acopioId ? (
          <Link
            to={`/exportadora/acopio/${lote.acopioId}`}
            className="text-xs text-stone-500 hover:text-emerald-300"
          >
            Lotes de este acopio
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
            Calidad apta para exportar
          </p>
          <div className="mt-4 flex items-center gap-6">
            <QualityRing value={lote.calidadExportPct} />
            <ul className="space-y-2 text-sm text-stone-300">
              <li>Inocuidad / LMR · {lote.semaforo === "verde" ? "100" : "45"}</li>
              <li>Genética certificada · 90</li>
              <li>Densidad y manejo · 88</li>
              <li>Fotos de campo · {lote.fotos?.length ?? 0}</li>
              <li className="text-stone-500">
                Promedio de este acopio (seleccionados) {promedio}% ·{" "}
                {delAcopio.length} lotes
              </li>
            </ul>
          </div>
          {lote.semaforo === "verde" ? (
            <p className="mt-4 rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-200">
              Este lote puede entrar al contenedor {CONTENEDOR}.
            </p>
          ) : (
            <p className="mt-4 rounded-xl bg-amber-500/15 p-3 text-sm text-amber-100">
              No embarcar. Faltan {lote.diasCarenciaRestantes} días de carencia.
              Un lote así tumba el contenedor en aduana.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-stone-500">
            Mapa de origen y llegada
          </p>
          <TraceMap ruta={lote.ruta} />
          <ul className="mt-4 grid gap-2 text-sm md:grid-cols-2">
            {lote.ruta.map((nodo) => (
              <li key={nodo.id} className="text-stone-300">
                <span className="text-emerald-400">{nodo.nombre}</span>
                <span className="block text-xs text-stone-500">
                  {nodo.fecha ?? "Por programar"} · {nodo.estado.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ExpedienteSenasa lote={lote} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <h3 className="mb-4 font-serif text-2xl text-white">
            Línea de tiempo del lote
          </h3>
          <BitacoraTimeline entries={lote.bitacora} />
        </section>
        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <h3 className="font-serif text-2xl text-white">Pasaporte QR</h3>
          <p className="mt-1 text-sm text-stone-400">
            El jurado escanea y ve origen, calidad e inocuidad.
          </p>
          <div className="mt-5 grid place-items-center rounded-2xl bg-white p-4">
            <QRCodeSVG value={qr} size={168} level="M" />
          </div>
          <p className="mt-3 text-center font-mono text-xs text-stone-500">
            {lote.id} · {lote.variedad}
          </p>
        </section>
      </div>
    </AppShell>
  );
}

function ExpedienteSenasa({ lote }: { lote: Lote }) {
  const items = expedienteExport(lote.semaforo, lote.cultivo);
  const tono = {
    listo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    bloquea: "border-amber-500/40 bg-amber-500/10 text-amber-100",
    espera: "border-white/10 bg-white/4 text-stone-300",
    riesgo: "border-rose-500/30 bg-rose-500/10 text-rose-100",
  } as const;

  return (
    <section className="mt-6 rounded-3xl border border-white/8 bg-white/3 p-6">
      <h3 className="font-serif text-2xl text-white">Expediente de exportación</h3>
      <p className="mt-1 max-w-3xl text-sm text-stone-400">
        AgroTrace no emite el certificado SENASA ni el sello SGS. Arma el dossier de parcela
        para que el inspector (VUCE) y la certificadora no lleguen a planta a ciegas.
      </p>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className={`rounded-2xl border p-4 ${tono[item.estado]}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
              {item.estado}
            </p>
            <p className="mt-1 font-medium text-white">{item.label}</p>
            <p className="mt-1 text-sm opacity-90">{item.nota}</p>
          </li>
        ))}
      </ul>
      <ul className="mt-5 flex flex-wrap gap-2">
        {CERTIFICADORAS.map((c) => (
          <li
            key={c.nombre}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-400"
          >
            <span className="text-stone-200">{c.nombre}</span>
            <span className="ml-1 opacity-70">· {c.tipo}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
