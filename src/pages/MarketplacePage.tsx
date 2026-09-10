import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Banner } from "../components/Banner";
import { Brand } from "../components/Brand";
import { useAuth } from "../state/AuthContext";

type Producto = {
  id: string;
  categoria: string;
  nombre: string;
  unidad: string;
  imagen: string;
  descripcion: string;
  precioLista: number;
  precioSocio: number;
  precio: number;
  socio: boolean;
};

type AcopioOpt = { id: string; nombre: string; zona: string };

const CAT_LABEL: Record<string, string> = {
  semilla: "Semillas certificadas",
  abono: "Abonos",
  quimico: "Químicos (malezas y plaga)",
};

export function MarketplacePage() {
  const { user } = useAuth();
  const [dni, setDni] = useState(user?.dni || "");
  const [socio, setSocio] = useState(Boolean(user?.socio));
  const [acopioNombre, setAcopioNombre] = useState(user?.acopioNombre || "");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState("");
  const [msg, setMsg] = useState<{ tipo: "ok" | "error" | "info"; texto: string } | null>(null);
  const [alta, setAlta] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [acopioId, setAcopioId] = useState(user?.acopioId || "");
  const [acopios, setAcopios] = useState<AcopioOpt[]>([]);

  function cargar(dniQuery?: string) {
    const q = dniQuery && dniQuery.replace(/\D/g, "").length === 8 ? `?dni=${dniQuery}` : "";
    api<{ socio: boolean; productos: Producto[] }>(`/api/market/productos${q}`)
      .then((data) => {
        setSocio(data.socio);
        setProductos(data.productos);
      })
      .catch((err: Error) => setMsg({ tipo: "error", texto: err.message }));
  }

  useEffect(() => {
    cargar(user?.dni || undefined);
    api<AcopioOpt[]>("/api/acopios").then(setAcopios).catch(() => undefined);
  }, [user?.dni]);

  async function verificar(event: FormEvent) {
    event.preventDefault();
    setMsg(null);
    try {
      const data = await api<{
        socio: boolean;
        dni: string;
        nombre?: string;
        acopioNombre?: string;
      }>("/api/market/verificar-dni", {
        method: "POST",
        body: JSON.stringify({ dni }),
      });
      setSocio(data.socio);
      setAlta(!data.socio);
      if (data.socio) {
        setAcopioNombre(data.acopioNombre || "");
        setMsg({
          tipo: "ok",
          texto: `Socio verificado · ${data.nombre} · ${data.acopioNombre}`,
        });
        cargar(dni);
      } else {
        setMsg({
          tipo: "info",
          texto: "Este DNI no está en el padrón. Puedes hacerte socio del acopio.",
        });
        cargar();
      }
    } catch (err) {
      setMsg({
        tipo: "error",
        texto: err instanceof Error ? err.message : "No se pudo verificar",
      });
    }
  }

  async function hacerseSocio(event: FormEvent) {
    event.preventDefault();
    setMsg(null);
    try {
      const data = await api<{
        socio: boolean;
        acopioNombre?: string;
        nombre: string;
      }>("/api/market/socio", {
        method: "POST",
        body: JSON.stringify({ dni, nombre, acopioId }),
      });
      setSocio(true);
      setAlta(false);
      setAcopioNombre(data.acopioNombre || "");
      setMsg({
        tipo: "ok",
        texto: `Ya eres socio de ${data.acopioNombre}. Precios de cooperativa activados.`,
      });
      cargar(dni);
    } catch (err) {
      setMsg({
        tipo: "error",
        texto: err instanceof Error ? err.message : "No se pudo registrar",
      });
    }
  }

  const visibles = useMemo(
    () => (categoria ? productos.filter((p) => p.categoria === categoria) : productos),
    [productos, categoria],
  );

  const inner = (
    <>
      <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 text-sm text-stone-300">
        {socio ? (
          <p>
            Precio de socio activo{acopioNombre ? ` · ${acopioNombre}` : ""}. Los
            no socios pagan lista. Los precios son referenciales; luego se
            actualizan con la tarifa real.
          </p>
        ) : (
          <p>
            Si eres socio del acopio, pon tu DNI de 8 dígitos y se aplica el
            precio especial. Si no, puedes darte de alta.
          </p>
        )}
      </div>

      <form onSubmit={verificar} className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="text-xs text-stone-400">
          DNI
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="40123456"
            inputMode="numeric"
            className="mt-1 block w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-3 text-white sm:w-40 sm:py-2 sm:text-sm"
          />
        </label>
        <button
          type="submit"
          className="min-h-12 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 sm:min-h-0"
        >
          Verificar socio
        </button>
        <label className="text-xs text-stone-400">
          Categoría
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-3 text-white sm:min-w-48 sm:py-2 sm:text-sm"
          >
            <option value="">Todo</option>
            <option value="semilla">Semillas</option>
            <option value="abono">Abonos</option>
            <option value="quimico">Químicos / malezas</option>
          </select>
        </label>
      </form>

      {alta ? (
        <form
          onSubmit={hacerseSocio}
          className="mb-8 grid gap-3 rounded-3xl border border-white/10 bg-white/4 p-5 md:grid-cols-3"
        >
          <label className="text-xs text-stone-400">
            Nombre
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-stone-400">
            Acopio
            <select
              value={acopioId}
              onChange={(e) => setAcopioId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#08110c] px-3 py-2 text-sm text-white"
            >
              <option value="">Elegir…</option>
              {acopios.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="self-end rounded-full border border-emerald-400/40 px-5 py-2 text-sm text-emerald-200"
          >
            Hacerme socio
          </button>
        </form>
      ) : null}

      {msg ? <Banner tipo={msg.tipo}>{msg.texto}</Banner> : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-3xl border border-white/8 bg-white/3"
          >
            <img src={item.imagen} alt={item.nombre} className="h-44 w-full object-cover" />
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-emerald-400">
                {CAT_LABEL[item.categoria] || item.categoria}
              </p>
              <h3 className="mt-1 font-serif text-xl text-white">{item.nombre}</h3>
              <p className="mt-1 text-xs text-stone-500">{item.unidad}</p>
              <p className="mt-2 text-sm text-stone-400">{item.descripcion}</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-serif text-2xl text-white">
                    S/ {item.precio.toFixed(2)}
                  </p>
                  {socio ? (
                    <p className="text-[11px] text-stone-500 line-through">
                      Lista S/ {item.precioLista.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-300">
                      Socio S/ {item.precioSocio.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );

  if (user?.role === "agricultor") {
    return (
      <AppShell
        eyebrow="Insumos de cooperativa"
        title="Marketplace de semillas, abonos y químicos"
        subtitle="Socio del acopio: precio especial. Si no estás en el padrón, verifica tu DNI o date de alta."
      >
        {inner}
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-[#08110c] text-stone-100">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Brand light />
          <Link to="/" className="text-xs text-stone-500 hover:text-emerald-300">
            ← Landing
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Tienda AgroTrace
        </p>
        <h1 className="mt-2 font-serif text-4xl text-white">
          Semillas certificadas, abonos y químicos
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-stone-400">
          El agricultor socio del acopio paga menos. Reemplaza las fotos en
          data/uploads/market y luego pasamos los precios reales.
        </p>
        <div className="mt-8">{inner}</div>
      </main>
    </div>
  );
}
