import { ArrowRight, Building2, Globe2, Leaf, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";
import { IMG } from "../data/mock";

const ROLES = [
  {
    to: "/ingresar/agricultor",
    icon: Leaf,
    title: "Agricultor",
    text: "Parcela, bitácora, cámara, tienda, densidad pl/ha y clima. Socio: precio especial con DNI.",
  },
  {
    to: "/ingresar/acopio",
    icon: Building2,
    title: "Acopio / cooperativa",
    text: "Registro de todos sus productores. Elige qué lote entra. Los deficientes ya no se reciben.",
  },
  {
    to: "/ingresar/exportadora",
    icon: Globe2,
    title: "Exportadora",
    text: "Ve todos sus acopios. Desglosa cada uno: productos y calidad de lo ya seleccionado.",
  },
];

export function LandingPage() {
  const [menu, setMenu] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08110c] text-stone-100">
      <header className="absolute inset-x-0 top-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <Brand light />
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/pitch"
              className="rounded-full border border-emerald-400/40 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/10"
            >
              Ver pitch
            </Link>
            <Link
              to="/tienda"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-emerald-400/50"
            >
              Tienda de insumos
            </Link>
            <Link
              to="/ingresar/agricultor"
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950"
            >
              Entrar al sistema
            </Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/ingresar/agricultor"
              className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950"
            >
              Entrar
            </Link>
            <button
              type="button"
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMenu((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white"
            >
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menu ? (
          <div className="border-b border-white/10 bg-[#08110c]/95 px-4 py-3 backdrop-blur-md md:hidden">
            <Link to="/pitch" className="block rounded-xl px-3 py-3 text-emerald-200" onClick={() => setMenu(false)}>
              Ver pitch
            </Link>
            <Link to="/tienda" className="block rounded-xl px-3 py-3 text-white" onClick={() => setMenu(false)}>
              Tienda de insumos
            </Link>
            <Link
              to="/ingresar/agricultor"
              className="block rounded-xl px-3 py-3 font-semibold text-emerald-300"
              onClick={() => setMenu(false)}
            >
              Entrar al sistema
            </Link>
          </div>
        ) : null}
      </header>

      <section className="relative min-h-[92vh] overflow-hidden">
        <img
          src={IMG.hero}
          alt="Mazorcas de cacao en selva peruana"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08110c] via-[#08110c]/80 to-[#08110c]/25" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:pb-20 sm:pt-32">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300 sm:text-xs sm:tracking-[0.28em]">
            Hackatón FIIS · cacao y agricultura del Perú
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-[1.1] text-white sm:text-4xl md:text-6xl">
            El pasaporte digital que acompaña al cacao desde la parcela hasta Europa.
          </h1>
          <p className="mt-5 max-w-xl text-base text-stone-300 md:text-lg">
            El agricultor no paga. La cooperativa y la exportadora blindan el
            contenedor: genética, manejo, inocuidad y trazabilidad en un solo hilo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/ingresar/agricultor"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-emerald-950"
            >
              Entrar como agricultor <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/pitch"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-white"
            >
              Ver el pitch (3 min)
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <Stat n="5 retos" l="en un solo flujo de trazabilidad" />
          <Stat n="S/ 1,200" l="al mes vs. USD 80–120 mil por contenedor" />
          <Stat n="0 mezclas" l="un activo, dosis por mochila, carencia visible" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          No adivinar en campo
        </p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl text-white md:text-4xl">
          Si nadie registra la maleza, la cámara y el sensor sí lo hacen.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/3 p-6">
            <p className="font-mono text-xs text-emerald-400">01 · Visión</p>
            <h3 className="mt-2 font-serif text-2xl text-white">
              Foto, no nombre científico
            </h3>
            <p className="mt-2 text-sm text-stone-400">
              El agricultor apunta a la hoja o la mazorca. El dataset local dice
              calidad de planta, enfermedad, maleza y un solo tratamiento. Sin
              foto en la ventana crítica, el acopio recibe alerta: se puede
              perder el 70%.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/3 p-6">
            <p className="font-mono text-xs text-emerald-400">02 · Suelo</p>
            <h3 className="mt-2 font-serif text-2xl text-white">
              Sensor donde iba la calicata
            </h3>
            <p className="mt-2 text-sm text-stone-400">
              Doce puntos en la parcela, no una muestra de otra ladera. Eliges
              cacao, maíz, café o plátano: si el suelo no es apto, el sistema
              arma el calendario de abono orgánico hasta que los sensores
              entren en rango.
            </p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/3 p-6">
            <p className="font-mono text-xs text-emerald-400">03 · Clima y foliar</p>
            <h3 className="mt-2 font-serif text-2xl text-white">
              Maíz con lluvia SENAMHI, no con calor
            </h3>
            <p className="mt-2 text-sm text-stone-400">
              El maíz amarillo duro es caja corta: se siembra cuando la estación
              arma milímetros, se foliar zinc al cogollo y se orienta al Este.
              El termómetro no es radiación.
            </p>
          </div>
        </div>
      </section>

      <section id="roles" className="bg-[#0c1812] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-3xl text-white">Quién entra al sistema</h2>
          <p className="mt-2 max-w-2xl text-stone-400">
            Misma verdad del lote, tres sesiones. Cada usuario entra por su
            puerta y no ve el tablero de los demás.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ROLES.map((role) => (
              <Link
                key={role.to}
                to={role.to}
                className="group rounded-3xl border border-white/10 bg-[#08110c] p-6 transition hover:border-emerald-500/50"
              >
                <role.icon className="h-7 w-7 text-emerald-400" />
                <h3 className="mt-4 font-serif text-2xl text-white">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm text-stone-400">{role.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-emerald-300">
                  Entrar a mi sesión <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="tienda" className="border-y border-white/5 bg-[#0c1812] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Insumos de cooperativa
          </p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl text-white md:text-4xl">
            Semillas certificadas, abonos y químicos. Socio paga menos.
          </h2>
          <p className="mt-3 max-w-2xl text-stone-400">
            El agricultor socio del acopio pone su DNI (8 dígitos) y ve el precio
            especial. Si no está en el padrón, puede hacerse socio. Fotos y
            precios son referenciales: luego se actualizan con la tarifa real.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <img
              src="/uploads/market/sem-ccn51.jpg"
              alt="Plantones certificados"
              className="h-44 w-full rounded-3xl object-cover"
            />
            <img
              src="/uploads/market/abo-compost.jpg"
              alt="Abonos"
              className="h-44 w-full rounded-3xl object-cover"
            />
            <img
              src="/uploads/market/qui-maleza.jpg"
              alt="Químicos para malezas"
              className="h-44 w-full rounded-3xl object-cover"
            />
          </div>
          <Link
            to="/tienda"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-emerald-950"
          >
            Ir al marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          <ShieldCheck className="h-8 w-8 text-amber-400" />
          <h2 className="mt-4 font-serif text-3xl text-white">
            Un lote mal aplicado no entra al contenedor.
          </h2>
          <p className="mt-3 text-stone-400">
            El acopio ya no recibe deficientes: selecciona el lote apto. La
            exportadora desglosa cada acopio y ve calidad de lo que sí entra al
            contenedor.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <img
            src={IMG.field}
            alt="Cultivo"
            className="h-56 w-full rounded-3xl object-cover"
          />
          <img
            src={IMG.port}
            alt="Contenedores de exportación"
            className="mt-8 h-56 w-full rounded-3xl object-cover"
          />
        </div>
      </section>

      <footer className="border-t border-white/5 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-xs text-stone-600">
        AgroTrace 360 · FIIS UNAS 2026 · El usuario es el agricultor. El cliente
        es la exportadora.
      </footer>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-white">{n}</p>
      <p className="mt-1 text-sm text-stone-400">{l}</p>
    </div>
  );
}
