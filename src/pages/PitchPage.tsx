import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, Play, Presentation } from "lucide-react";
import { Brand } from "../components/Brand";
import { PITCH_IMGS, PITCH_SEGS, EQUIPO } from "../data/pitch";
import { capturarLaminas, guardarPdf, guardarPpt } from "../lib/exportPitch";
import { useNotice } from "../state/NoticeContext";

export function PitchPage() {
  const { toast } = useNotice();
  const [i, setI] = useState(0);
  const [exportando, setExportando] = useState<"pdf" | "ppt" | null>(null);
  const [paso, setPaso] = useState(0);
  const n = 11;
  const slideRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const iRef = useRef(i);
  const waiters = useRef<Array<(n: number) => void>>([]);
  iRef.current = i;

  useEffect(() => {
    waiters.current.forEach((fn) => fn(i));
  }, [i]);

  function irA(k: number) {
    return new Promise<void>((resolve) => {
      if (iRef.current === k) {
        resolve();
        return;
      }
      const fn = (nro: number) => {
        if (nro !== k) return;
        waiters.current = waiters.current.filter((x) => x !== fn);
        resolve();
      };
      waiters.current.push(fn);
      setI(k);
    });
  }

  async function descargar(tipo: "pdf" | "ppt") {
    const nodo = slideRef.current;
    if (!nodo || exportando) return;
    setExportando(tipo);
    setPaso(0);
    try {
      const fotos = await capturarLaminas(n, irA, nodo, setPaso);
      if (tipo === "pdf") await guardarPdf(fotos);
      else await guardarPpt(fotos);
      toast({
        tipo: "ok",
        titulo: tipo === "pdf" ? "PDF listo" : "Presentación lista",
        texto: "El archivo se descargó.",
      });
    } catch (err) {
      console.error(err);
      toast({
        tipo: "error",
        titulo: "No se pudo generar el archivo",
        texto: "Recarga e inténtalo de nuevo.",
      });
    } finally {
      setExportando(null);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (exportando) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setI((v) => Math.min(n - 1, v + 1));
      }
      if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
      if (e.key === "Home") setI(0);
      if (e.key === "End") setI(n - 1);
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        void descargar("ppt");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exportando]);

  return (
    <div className="min-h-screen bg-[#1a120c] text-amber-50">
      {exportando ? (
        <div className="print:hidden pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-[#1a120c] shadow-lg">
          Capturando lámina {paso + 1}/{n} para {exportando === "ppt" ? "PowerPoint" : "PDF"}…
        </div>
      ) : null}

      <header className="print:hidden sticky top-0 z-30 border-b border-amber-200/15 bg-[#1a120c]/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
          <Brand light />
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden font-mono text-[11px] tracking-wider text-amber-200/50 sm:inline">
              {String(i + 1).padStart(2, "0")}/11 · {PITCH_SEGS[i]}s
            </span>
            <button
              type="button"
              disabled={!!exportando}
              onClick={() => void descargar("ppt")}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-amber-400 px-3 py-2 text-xs font-semibold text-[#1a120c] disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              <Presentation className="h-4 w-4" /> PPT
            </button>
            <button
              type="button"
              disabled={!!exportando}
              onClick={() => void descargar("pdf")}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-amber-200/30 px-3 py-2 text-xs text-amber-100 disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              <Download className="h-4 w-4" /> PDF
            </button>
            <Link
              to="/ingresar/agricultor"
              className="inline-flex min-h-10 items-center rounded-full border border-amber-200/30 px-3 py-2 text-xs text-amber-100 sm:px-4 sm:text-sm"
            >
              Demo
            </Link>
          </div>
        </div>
      </header>

      <div className="print:hidden mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        <div
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchX.current == null || exportando) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
            touchX.current = null;
            if (dx < -48) setI((v) => Math.min(n - 1, v + 1));
            if (dx > 48) setI((v) => Math.max(0, v - 1));
          }}
        >
          <SlideFrame index={i} plano={!!exportando} slideRef={slideRef} fijo={!!exportando} />
        </div>
        <p className="mt-2 text-center text-[11px] text-amber-100/50 sm:hidden">
          Desliza para cambiar de lámina · {i + 1}/11
        </p>
        <div className="mt-4 flex items-center justify-between gap-2 sm:mt-5">
          <button
            type="button"
            disabled={i === 0 || !!exportando}
            onClick={() => setI((v) => v - 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-200/20 px-3 py-2 text-sm text-amber-100 disabled:opacity-30 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <div className="flex max-w-[45%] flex-wrap justify-center gap-1.5">
            {Array.from({ length: n }, (_, k) => (
              <button
                key={k}
                type="button"
                onClick={() => setI(k)}
                className={`h-2.5 w-2.5 rounded-full ${
                  k === i ? "bg-amber-400" : "bg-amber-100/20"
                }`}
                aria-label={`Lámina ${k + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={i === n - 1 || !!exportando}
            onClick={() => setI((v) => v + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-400/90 px-3 py-2 text-sm font-semibold text-[#1a120c] disabled:opacity-30 sm:px-4"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="hidden print:block">
        {Array.from({ length: n }, (_, k) => (
          <div key={k} className="print-slide">
            <SlideFrame index={k} plano />
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideFrame({
  index,
  plano,
  slideRef,
  fijo,
}: {
  index: number;
  plano?: boolean;
  slideRef?: Ref<HTMLDivElement>;
  fijo?: boolean;
}) {
  return (
    <div
      ref={slideRef}
      className={
        plano
          ? "overflow-hidden bg-[#22170f] print:h-full print:rounded-none print:shadow-none"
          : "overflow-hidden rounded-3xl border border-amber-200/15 bg-[#22170f] shadow-[0_20px_80px_rgba(0,0,0,0.45)] print:rounded-none print:border-0 print:shadow-none"
      }
    >
      <div
        className={
          fijo
            ? "aspect-video p-4 md:p-6 print:h-full print:aspect-auto"
            : "min-h-[62dvh] p-3 sm:aspect-video sm:min-h-0 sm:p-4 md:p-6 print:h-full print:aspect-auto"
        }
      >
        {index === 0 && <S0 />}
        {index === 1 && <S1 />}
        {index === 2 && <S2 />}
        {index === 3 && <S3 />}
        {index === 4 && <S4 />}
        {index === 5 && <S5 />}
        {index === 6 && <S6 />}
        {index === 7 && <S7 />}
        {index === 8 && <S8 />}
        {index === 9 && <S9 />}
        {index === 10 && <S10 />}
      </div>
    </div>
  );
}

function S0() {
  return (
    <div className="relative flex h-full flex-col justify-end overflow-hidden rounded-2xl">
      <img src={PITCH_IMGS.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-[#1a120c] via-[#1a120c]/55 to-transparent" />
      <div className="relative p-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
          Hackatón FIIS UNAS 2026 · cacao y agricultura del Perú
        </p>
        <h1 className="mt-2 font-serif text-4xl text-white drop-shadow sm:text-5xl md:text-6xl">
          AgroTrace 360
        </h1>
        <p className="mt-3 max-w-xl text-lg text-amber-50">
          El pasaporte digital del cacao: de la parcela a Rotterdam.
        </p>
      </div>
    </div>
  );
}

function S1() {
  return (
    <div className="grid h-full gap-4 md:grid-cols-3">
      <CardFoto img={PITCH_IMGS.semilla} k="14 %" t="del área agrícola usa semilla certificada" />
      <CardFoto img={PITCH_IMGS.cacao} k="70 %" t="se puede perder si nadie registra la maleza a tiempo" />
      <CardFoto img={PITCH_IMGS.port} k="USD 80–120 mil" t="cuesta un contenedor rechazado en aduana" />
    </div>
  );
}

function S2() {
  return (
    <div className="grid h-full gap-6 md:grid-cols-2">
      <img
        src={PITCH_IMGS.field}
        alt=""
        className="h-44 w-full rounded-2xl object-cover sm:h-full"
      />
      <div className="flex flex-col justify-center">
        <p className="font-serif text-3xl text-white md:text-4xl">
          Vendemos a quien pierde el contenedor.
        </p>
        <p className="mt-3 text-sm text-amber-50/80">
          Quien ya exporta cacao y maíz, y paga SENASA + SGS cuando el lote ya está en planta.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-amber-50/90">
          <li>
            <b className="text-amber-300">Cacao:</b> Machu Picchu Foods, ACOPAGRO, Sumaqao, Agro San Gerardo.
          </li>
          <li>
            <b className="text-amber-300">Maíz y granos:</b> Inti Consorcio, Agro Fergi, Industria de Granos, Ecoandino.
          </li>
          <li>
            <b className="text-amber-300">Usuario:</b> el agricultor. No paga.
          </li>
        </ul>
      </div>
    </div>
  );
}

function S3() {
  return (
    <Lienzo img={PITCH_IMGS.warehouse}>
      <p className="font-serif text-3xl text-white drop-shadow md:text-4xl">
        Hoy se “resuelve” así. No alcanza.
      </p>
      <div className="mt-4 grid min-h-0 flex-1 gap-3 md:grid-cols-3">
        <MiniFoto
          img={PITCH_IMGS.phone}
          n="Cuaderno y WhatsApp"
          d="Nadie ve la carencia hasta que el camión ya salió."
        />
        <MiniFoto
          img={PITCH_IMGS.warehouse}
          n="Pagan SGS / Control Union tarde"
          d="La auditoría llega a planta. El campo no dejó rastro."
        />
        <MiniFoto
          img={PITCH_IMGS.port}
          n="SENASA en el puerto"
          d="Sin expediente de origen, un gorgojo o un LMR tumba el lote."
        />
      </div>
    </Lienzo>
  );
}

function S4() {
  return (
    <div className="relative flex h-full items-center overflow-hidden rounded-2xl">
      <img src={PITCH_IMGS.cacao} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#1a120c]/55" />
      <div className="relative max-w-3xl p-4">
        <p className="text-sm uppercase tracking-[0.22em] text-amber-300">Por eso presentamos</p>
        <p className="mt-3 font-serif text-4xl text-white md:text-5xl">
          AgroTrace 360: tres sesiones, una sola verdad del lote.
        </p>
      </div>
    </div>
  );
}

function S5() {
  return (
    <div className="grid h-full min-h-0 gap-4 md:grid-cols-3">
      <Paso
        n="1"
        img={PITCH_IMGS.maiz}
        t="El agricultor siembra bien"
        d="Decide con dato, no con costumbre."
        puntos={[
          "Semilla o clon certificado",
          "Densidad: plantas/ha en el punto",
          "12 sensores de suelo (pH, NPK, Zn)",
          "Lluvia SENAMHI: cuándo sembrar",
          "Foliar por etapa + cámara IA",
        ]}
      />
      <Paso
        n="2"
        img={PITCH_IMGS.foliar}
        t="El acopio selecciona"
        d="Ya no recibe lo que tumba el contenedor."
        puntos={[
          "Registro de todos sus productores",
          "Calidad e inocuidad por lote",
          "Carencia o bloqueo: se rechaza",
          "Solo el verde pasa a exportadora",
        ]}
      />
      <Paso
        n="3"
        img={PITCH_IMGS.port}
        t="La exportadora embarca"
        d="Una verdad del lote hasta destino."
        puntos={[
          "Ve todos sus acopios",
          "Desglosa producto y % de calidad",
          "Mapa, QR y % de calidad",
          "Carencia / LMR a la vista",
          "Expediente listo para SENASA y SGS",
        ]}
      />
    </div>
  );
}

function S6() {
  return (
    <Lienzo img={PITCH_IMGS.abono} overlay="from-[#1a120c] via-[#1a120c]/80 to-[#1a120c]/45">
      <p className="font-serif text-3xl text-white md:text-4xl">Quién paga. Quién gana.</p>
      <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center space-y-2 text-sm">
          <Plan nombre="Agricultor" precio="S/ 0" d="Adopción. Socio del acopio: precio de tienda." />
          <Plan nombre="Acopio" precio="S/ 450 / mes" d="Hasta 80 productores. Ranking y selección." />
          <Plan nombre="Exportadora" precio="S/ 1 200 / mes" d="Acopios + expediente SENASA / SGS." />
          <Plan nombre="Tienda de insumos" precio="10 %" d="Comisión sobre semilla, abono y químico." />
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-amber-400/95 p-7 text-[#1a120c] shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">Año 1 · Perú</p>
          <p className="mt-1 font-serif text-5xl">S/ 75 600</p>
          <ul className="mt-4 space-y-1 text-sm">
            <li>6 acopios × 450 × 12 = S/ 32 400</li>
            <li>2 exportadoras × 1 200 × 12 = S/ 28 800</li>
            <li>Comisión tienda = S/ 14 400</li>
          </ul>
          <p className="mt-4 text-xs opacity-70">Cifras referenciales de arranque.</p>
        </div>
      </div>
    </Lienzo>
  );
}

function S7() {
  return (
    <Lienzo img={PITCH_IMGS.ship}>
      <p className="font-serif text-3xl text-white drop-shadow md:text-4xl">
        Un contenedor salvado paga el año.
      </p>
      <div className="mt-4 grid min-h-0 flex-1 gap-3 md:grid-cols-3">
        <MiniFoto
          img={PITCH_IMGS.port}
          n="S/ 14 400 vs USD 80 mil"
          d="12 meses de AgroTrace vs un contenedor rechazado por SENASA o por LMR."
        />
        <MiniFoto
          img={PITCH_IMGS.cacao}
          n="El inspector llega con evidencia"
          d="Bitácora, carencia y fotos. Control Union y SGS no auditan a ciegas."
        />
        <MiniFoto
          img={PITCH_IMGS.field}
          n="El agricultor rinde más"
          d="Clon certificado, densidad en el punto, zinc a tiempo. Sin pagar la app."
        />
      </div>
    </Lienzo>
  );
}

function S8() {
  return (
    <div className="grid h-full items-center gap-8 md:grid-cols-2">
      <div>
        <p className="font-serif text-3xl text-white">A 12 meses, la misma tubería.</p>
        <ul className="mt-6 space-y-3 text-amber-50/90">
          <li>
            <b className="text-amber-300">6 meses:</b> 4 acopios en regiones productoras y 1 exportadora en producción.
          </li>
          <li>
            <b className="text-amber-300">12 meses:</b> café, plátano y maíz amarillo duro sobre el mismo hilo.
          </li>
          <li>
            <b className="text-amber-300">Socios:</b> SENASA y SGS / Control Union. No los reemplazamos: les damos el expediente de campo.
          </li>
        </ul>
      </div>
      <img
        src={PITCH_IMGS.horizonte}
        alt=""
        className="h-56 w-full rounded-2xl object-cover md:h-full"
      />
    </div>
  );
}

function S9() {
  return (
    <Lienzo img={PITCH_IMGS.hero} overlay="from-[#1a120c] via-[#1a120c]/75 to-[#1a120c]/40">
      <div className="text-center">
        <p className="font-serif text-3xl text-white drop-shadow md:text-4xl">Equipo FIIS UNAS</p>
        <p className="mt-1 text-sm text-amber-100/85">
          Agronomía + Informática y Sistemas. Una sola misión: que el lote apto sí salga.
        </p>
      </div>
      <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-3 md:grid-cols-4">
        {EQUIPO.map((p) => (
          <Rol key={p.nombre} {...p} />
        ))}
      </div>
    </Lienzo>
  );
}

function S10() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl text-center">
      <img src={PITCH_IMGS.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#1a120c]/60" />
      <div className="relative px-4">
        <p className="font-serif text-4xl text-white md:text-5xl">El agricultor no paga.</p>
        <p className="mt-2 font-serif text-3xl text-amber-300 md:text-4xl">
          La exportadora no pierde el contenedor.
        </p>
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-amber-50">
          <Play className="h-4 w-4 text-amber-300" /> Ahora el demo.
        </p>
      </div>
    </div>
  );
}

function CardFoto({ img, k, t }: { img: string; k: string; t: string }) {
  return (
    <figure className="relative h-full overflow-hidden rounded-2xl">
      <img src={img} alt="" className="h-full min-h-48 w-full object-cover" />
      <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 p-4">
        <p className="font-serif text-3xl text-amber-300">{k}</p>
        <p className="mt-1 text-sm text-white">{t}</p>
      </figcaption>
    </figure>
  );
}

function Lienzo({
  img,
  overlay = "from-[#1a120c] via-[#1a120c]/72 to-[#1a120c]/35",
  children,
}: {
  img: string;
  overlay?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl max-sm:min-h-[22rem]">
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className={`absolute inset-0 bg-linear-to-t ${overlay}`} />
      <div className="relative flex h-full min-h-0 flex-col p-1">{children}</div>
    </div>
  );
}

function MiniFoto({ img, n, d }: { img: string; n: string; d: string }) {
  return (
    <figure className="relative h-full min-h-40 overflow-hidden rounded-2xl ring-1 ring-amber-200/20 sm:min-h-0">
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/10" />
      <figcaption className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <p className="font-medium text-amber-200">{n}</p>
        <p className="mt-2 text-sm leading-snug text-white/90">{d}</p>
      </figcaption>
    </figure>
  );
}

function Paso({
  n,
  img,
  t,
  d,
  puntos,
}: {
  n: string;
  img: string;
  t: string;
  d: string;
  puntos: string[];
}) {
  return (
    <figure className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-amber-200/10 bg-black/20 max-sm:min-h-[18rem]">
      <img src={img} alt="" className="h-[42%] w-full shrink-0 object-cover" />
      <figcaption className="flex min-h-0 flex-1 flex-col px-4 py-3">
        <p className="font-mono text-xs text-amber-300">{n}</p>
        <p className="mt-1 font-serif text-xl text-white">{t}</p>
        <p className="mt-1 text-xs text-amber-100/70">{d}</p>
        <ul className="mt-3 space-y-1.5 text-xs leading-snug text-amber-50/85">
          {puntos.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
              {item}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

function Plan({ nombre, precio, d }: { nombre: string; precio: string; d: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-amber-200/20 bg-[#1a120c]/75 px-4 py-4 backdrop-blur-sm">
      <div>
        <p className="text-white">{nombre}</p>
        <p className="text-xs text-amber-100/50">{d}</p>
      </div>
      <p className="shrink-0 font-serif text-xl text-amber-300">{precio}</p>
    </div>
  );
}

function Rol({
  nombre,
  rol,
  carrera,
  foto,
  foco,
}: {
  nombre: string;
  rol: string;
  carrera: string;
  foto: string;
  foco: string;
}) {
  return (
    <figure className="relative h-full min-h-32 overflow-hidden rounded-2xl ring-1 ring-amber-200/25 sm:min-h-0">
      <img
        src={foto}
        alt={nombre}
        style={{ objectPosition: foco }}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />
      <figcaption className="absolute inset-x-0 bottom-0 p-3 text-left">
        <p className="text-sm font-medium leading-tight text-white">{nombre}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-300">{rol}</p>
        <p className="text-[11px] leading-tight text-white/70">{carrera}</p>
      </figcaption>
    </figure>
  );
}
