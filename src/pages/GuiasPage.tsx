import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Banner } from "../components/Banner";
import { CULTIVOS, type CultivoId } from "../data/agronomiaCampo";
import {
  FOTO_HORIZONTE,
  FOTO_LLUVIA,
  GUIAS,
  HORIZONTES,
} from "../data/guiasCampo";

type DiaClima = {
  fecha: string;
  lluviaMm: number;
  tMax: number;
  tMin: number;
  radiacionMj: number;
  calorSinLuz: boolean;
  nota: string;
};

type Clima = {
  estacion: { nombre: string; senamhi: string };
  fuentePrecipitacion: string;
  fuenteRadiacion: string;
  dias: DiaClima[];
  lluvia7: number;
  lluvia48: number;
  lluvia6h: number;
  ventanaFoliar: { hora: string; t: number; w: number } | null;
  contraste: DiaClima | null;
  diaMasCaliente: { fecha: string; tMax: number; radiacionMj: number } | null;
  diaMasRadiacion: { fecha: string; tMax: number; radiacionMj: number } | null;
};

function fmtFecha(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function GuiasPage() {
  const [cultivo, setCultivo] = useState<CultivoId>("maiz");
  const [clima, setClima] = useState<Clima | null>(null);
  const [error, setError] = useState("");
  const guia = GUIAS[cultivo];
  const consejo = useMemo(() => {
    if (!clima) return null;
    if (clima.lluvia48 > guia.siembra.lluviaMax48h) {
      return {
        ok: false,
        titulo: "Espera: exceso de lluvia",
        texto: `${clima.lluvia48} mm en 48 h. ${guia.siembra.noSembrarSi}`,
      };
    }
    if (clima.lluvia7 < guia.siembra.lluviaMinMm) {
      return {
        ok: false,
        titulo: "Aún no siembres",
        texto: `Van ${clima.lluvia7} mm en 7 días. Faltan ~${guia.siembra.lluviaMinMm} mm de lluvia útil (SENAMHI / estación). ${guia.siembra.cuando}`,
      };
    }
    return {
      ok: true,
      titulo: "Ventana de siembra abierta",
      texto: `${clima.lluvia7} mm en 7 días y ${clima.lluvia48} mm en 48 h. ${guia.siembra.cuando}`,
    };
  }, [clima, guia]);

  useEffect(() => {
    let vivo = true;
    setError("");
    api<Clima>("/api/clima")
      .then((data) => {
        if (!vivo) return;
        setClima(data);
      })
      .catch((err: Error) => {
        if (vivo) setError(err.message);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const maxRad = useMemo(
    () => Math.max(...(clima?.dias.map((d) => d.radiacionMj) ?? [1]), 1),
    [clima],
  );

  return (
    <AppShell
      eyebrow="Agricultor · charla de campo"
      title="Cuándo sembrar, foliar y a qué horizonte"
      subtitle="Maíz amarillo duro primero (ciclo corto). Luego cacao, café y plátano. La lluvia es SENAMHI de Tingo María. El calor del aire no es radiación."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {CULTIVOS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCultivo(item.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              cultivo === item.id
                ? item.id === "maiz"
                  ? "bg-amber-500 text-stone-950 font-semibold"
                  : "bg-emerald-500 text-emerald-950 font-semibold"
                : "border border-white/15 text-stone-300"
            }`}
          >
            {item.nombre}
            {item.id === "maiz" ? " · énfasis" : ""}
          </button>
        ))}
      </div>

      {guia.enfasis ? (
        <Banner tipo="info">
          {guia.enfasis}{" "}
          <Link to="/agricultor/densidad" className="font-semibold underline-offset-4 hover:underline">
            Calcular plantas/ha →
          </Link>
        </Banner>
      ) : null}

      <div className="mb-8 overflow-hidden rounded-3xl border border-white/8">
        <img src={guia.fotoCampo} alt={guia.nombre} className="h-56 w-full object-cover" />
      </div>

      {error ? <Banner tipo="error">{error}</Banner> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-400">
            SENAMHI · precipitación
          </p>
          <h3 className="mt-1 font-serif text-2xl text-white">
            {clima?.estacion.senamhi ?? "Estación Tingo María"}
          </h3>
          <img
            src={FOTO_LLUVIA}
            alt="Lluvia de siembra"
            className="mt-4 h-36 w-full rounded-2xl object-cover"
          />
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-stone-400 sm:text-xs">
            <div className="rounded-xl bg-black/30 p-2 sm:p-3">
              7 días
              <b className="mt-1 block font-serif text-lg text-white sm:text-2xl">
                {clima?.lluvia7 ?? "—"} mm
              </b>
            </div>
            <div className="rounded-xl bg-black/30 p-2 sm:p-3">
              48 h
              <b className="mt-1 block font-serif text-lg text-white sm:text-2xl">
                {clima?.lluvia48 ?? "—"} mm
              </b>
            </div>
            <div className="rounded-xl bg-black/30 p-2 sm:p-3">
              Próx. 6 h
              <b className="mt-1 block font-serif text-lg text-white sm:text-2xl">
                {clima?.lluvia6h ?? "—"} mm
              </b>
            </div>
          </dl>
          {consejo ? (
            <p
              className={`mt-4 rounded-xl p-4 text-sm ${
                consejo.ok
                  ? "bg-emerald-500/15 text-emerald-100"
                  : "bg-amber-500/15 text-amber-100"
              }`}
            >
              <b className="block">{consejo.titulo}</b>
              {consejo.texto}
            </p>
          ) : (
            <p className="mt-4 text-sm text-stone-400">Leyendo lluvias de la zona…</p>
          )}
          <p className="mt-3 text-[11px] text-stone-500">{clima?.fuentePrecipitacion}</p>
        </section>

        <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
            Radiación ≠ calor
          </p>
          <h3 className="mt-1 font-serif text-2xl text-white">
            Hacia el Este, no hacia el horno del oeste
          </h3>
          <img
            src={FOTO_HORIZONTE}
            alt="Horizonte este al amanecer"
            className="mt-4 h-36 w-full rounded-2xl object-cover"
          />
          <p className="mt-4 text-sm text-stone-300">{guia.horizonte.porQue}</p>
          <p className="mt-2 text-sm text-emerald-200">
            Orientación: {guia.horizonte.hacia}
          </p>
          <p className="mt-1 text-xs text-amber-200">{guia.horizonte.evitar}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {HORIZONTES.map((h) => (
              <div
                key={h.id}
                className={`rounded-xl p-3 text-center text-xs ${
                  h.ok
                    ? "bg-emerald-500/20 text-emerald-100"
                    : "bg-black/30 text-stone-500"
                }`}
              >
                <span className="font-serif text-2xl text-white">{h.id}</span>
                <p className="mt-1">{h.label}</p>
              </div>
            ))}
          </div>
          {clima?.diaMasCaliente && clima.diaMasRadiacion ? (
            <p className="mt-4 text-xs text-stone-400">
              El día más caliente ({fmtFecha(clima.diaMasCaliente.fecha)} ·{" "}
              {clima.diaMasCaliente.tMax} °C) tiene {clima.diaMasCaliente.radiacionMj} MJ/m².
              El de más radiación ({fmtFecha(clima.diaMasRadiacion.fecha)}) llega a{" "}
              {clima.diaMasRadiacion.radiacionMj} MJ/m² con {clima.diaMasRadiacion.tMax} °C.
              No coinciden siempre.
            </p>
          ) : null}
        </section>
      </div>

      {clima ? (
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/8">
          <div className="bg-white/3 px-6 py-4">
            <h3 className="font-serif text-xl text-white">7 días: lluvia, calor y luz</h3>
          </div>
          <div className="grid gap-px bg-white/5 sm:grid-cols-7">
            {clima.dias.map((dia) => (
              <div key={dia.fecha} className="bg-[#08110c] p-3">
                <p className="text-[11px] text-stone-500">{fmtFecha(dia.fecha)}</p>
                <p className="text-sm text-sky-200">{dia.lluviaMm} mm</p>
                <p className="text-sm text-white">{dia.tMax} °C</p>
                <div className="mt-2 flex h-16 items-end rounded bg-black/40">
                  <div
                    className={`w-full rounded-t ${
                      dia.calorSinLuz ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ height: `${Math.max(12, (dia.radiacionMj / maxRad) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-stone-400">{dia.radiacionMj} MJ</p>
                {dia.calorSinLuz ? (
                  <p className="mt-1 text-[10px] text-amber-200">Calor sin luz</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-white/3">
          <img src={guia.fotoFoliar} alt={`Foliar ${guia.nombre}`} className="h-64 w-full object-cover" />
          <div className="p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-400">Cómo foliar</p>
            <h3 className="mt-1 font-serif text-2xl text-white">{guia.nombre}</h3>
            <p className="mt-2 text-sm text-stone-300">{guia.foliar.paraQue}</p>
            <p className="mt-3 text-sm text-white">
              {guia.foliar.producto}
              <span className="mt-1 block text-xs text-stone-400">{guia.foliar.dosis}</span>
            </p>
            <p className="mt-2 text-xs text-amber-100">{guia.foliar.momento}</p>
            {clima?.ventanaFoliar ? (
              <p className="mt-3 rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-100">
                Próxima ventana hoy: {clima.ventanaFoliar.hora} · {clima.ventanaFoliar.t} °C ·{" "}
                {clima.ventanaFoliar.w} W/m². Si en 6 h hay {clima.lluvia6h} mm, no salgas.
              </p>
            ) : (
              <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-100">
                No hay hora limpia en las próximas horas (lluvia, calor o radiación alta). Espera
                mañana temprano.
              </p>
            )}
          </div>
        </div>
        <ol className="space-y-3">
          {guia.foliar.como.map((paso) => (
            <li
              key={paso.n}
              className="rounded-2xl border border-white/8 bg-white/3 p-4"
            >
              <p className="font-mono text-[11px] text-emerald-400">Paso {paso.n}</p>
              <h4 className="font-medium text-white">{paso.titulo}</h4>
              <p className="mt-1 text-sm text-stone-400">{paso.texto}</p>
            </li>
          ))}
          <li className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 text-sm text-amber-100">
            <p className="font-medium">No hacer</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {guia.foliar.noHacer.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        </ol>
      </section>
    </AppShell>
  );
}
