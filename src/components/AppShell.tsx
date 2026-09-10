import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Brand } from "./Brand";
import { AgricultorNav } from "./AgricultorNav";
import { AcopioNav } from "./AcopioNav";
import { useAuth } from "../state/AuthContext";

export function AppShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const rol = user?.role;

  return (
    <div className="min-h-screen bg-[#08110c] text-stone-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#08110c]/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Brand light />
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {user ? (
              <p className="hidden min-w-0 truncate text-xs text-stone-400 sm:block">
                <span className="font-medium text-white">{user.nombre}</span>
                <span className="mx-2 text-stone-600">·</span>
                {user.comunidad}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="min-h-10 shrink-0 rounded-full border border-white/15 px-3 py-2 text-xs text-stone-300 hover:border-emerald-400/40 hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main
        className={`mx-auto max-w-6xl px-4 py-6 md:py-8 ${
          rol === "agricultor" || rol === "acopio" ? "pb-28 md:pb-8" : "pb-8"
        }`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 sm:text-xs">
          {eyebrow}
        </p>
        <div className="mt-2 mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl text-white sm:text-3xl md:text-4xl">{title}</h1>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm text-stone-400">{subtitle}</p>
            ) : null}
          </div>
          <Link
            to="/"
            className="hidden text-xs text-stone-500 underline-offset-4 hover:text-emerald-300 hover:underline sm:inline"
          >
            ← Volver a la landing
          </Link>
        </div>
        {rol === "agricultor" ? <AgricultorNav /> : null}
        {rol === "acopio" ? <AcopioNav /> : null}
        {children}
      </main>
    </div>
  );
}

export function SemaforoPill({ value }: { value: "verde" | "ambar" | "rojo" }) {
  const map = {
    verde: "bg-emerald-600 text-white",
    ambar: "bg-amber-500 text-stone-950",
    rojo: "bg-red-600 text-white",
  };
  const label = {
    verde: "Apto",
    ambar: "En carencia",
    rojo: "Bloqueado",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${map[value]}`}
    >
      {label[value]}
    </span>
  );
}
