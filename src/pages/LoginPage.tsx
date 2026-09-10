import { useState, type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import type { Role } from "../api/client";
import { Banner } from "../components/Banner";
import { Brand } from "../components/Brand";
import { homeFor, useAuth } from "../state/AuthContext";

const ROLES: Role[] = ["agricultor", "acopio", "exportadora"];

const COPY: Record<
  Role,
  { title: string; text: string; cuentas: { email: string; quien: string }[] }
> = {
  agricultor: {
    title: "Entrar como agricultor",
    text: "Parcela, bitácora, cámara y tienda. Si eres socio, verifica tu DNI de 8 dígitos para el precio especial.",
    cuentas: [
      { email: "jose@agrotrace.pe", quien: "José · DNI 40123456 · socio Huallaga" },
      { email: "elena@agrotrace.pe", quien: "Elena · DNI 40987654 · carencia (no se selecciona)" },
      { email: "pedro@agrotrace.pe", quien: "Pedro · DNI 40777777 · socio Aucayacu" },
    ],
  },
  acopio: {
    title: "Entrar como acopio",
    text: "Registro de tus productores. Tú eliges qué lote entra; los deficientes ya no se reciben.",
    cuentas: [
      { email: "maria@agrotrace.pe", quien: "María · Alto Huallaga" },
      { email: "luis@agrotrace.pe", quien: "Luis · Aucayacu" },
    ],
  },
  exportadora: {
    title: "Entrar como exportadora",
    text: "Ves todos tus acopios. Desglosas cada lote seleccionado y el expediente listo para SENASA / SGS.",
    cuentas: [{ email: "export@agrotrace.pe", quien: "Claudia Ramos · exportadora" }],
  },
};

export function LoginPage() {
  const { rol } = useParams();
  const role = ROLES.includes(rol as Role) ? (rol as Role) : null;
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState(role ? COPY[role].cuentas[0].email : "");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  if (!role) return <Navigate to="/" replace />;
  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const copy = COPY[role];

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSending(true);
    try {
      const next = await login(email.trim(), password);
      if (next.role !== role) {
        logout();
        setError(`Esta cuenta es de ${next.role}. Entra por la puerta de ${next.role}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo entrar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08110c] text-stone-100">
      <header className="mx-auto flex max-w-lg items-center justify-between px-4 py-6">
        <Brand light />
        <Link to="/" className="text-xs text-stone-500 hover:text-emerald-300">
          ← Landing
        </Link>
      </header>
      <main className="mx-auto max-w-lg px-4 pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Sesión {role}
        </p>
        <h1 className="mt-2 font-serif text-3xl text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 text-sm text-stone-400">{copy.text}</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-white/10 bg-white/4 p-6"
        >
          <label className="block text-xs text-stone-400">
            Correo
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full min-h-12 rounded-xl border border-white/10 bg-[#08110c] px-3 py-3 text-white"
            />
          </label>
          <label className="mt-3 block text-xs text-stone-400">
            Clave
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full min-h-12 rounded-xl border border-white/10 bg-[#08110c] px-3 py-3 text-white"
            />
          </label>
          {error ? (
            <Banner tipo="error" className="mt-4 mb-0!">
              {error}
            </Banner>
          ) : null}
          <button
            type="submit"
            disabled={sending}
            className="mt-5 w-full min-h-12 rounded-full bg-emerald-500 py-3 text-sm font-semibold text-emerald-950 disabled:opacity-60"
          >
            {sending ? "Entrando…" : "Entrar a mi pantalla"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/8 p-4 text-sm text-stone-400">
          <p className="text-xs uppercase tracking-wider text-stone-500">
            Cuentas de demo · clave demo123
          </p>
          <ul className="mt-2 space-y-1">
            {copy.cuentas.map((cuenta) => (
              <li key={cuenta.email}>
                <button
                  type="button"
                  className="text-left text-emerald-300 hover:underline"
                  onClick={() => {
                    setEmail(cuenta.email);
                    setPassword("demo123");
                  }}
                >
                  {cuenta.email}
                </button>
                <span className="block text-xs text-stone-500">{cuenta.quien}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
