import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

const TONO = {
  ok: "border-emerald-400/25 bg-emerald-950/40 text-emerald-100",
  error: "border-red-400/25 bg-red-950/40 text-red-100",
  info: "border-amber-400/25 bg-amber-950/35 text-amber-100",
};

const BARRA = {
  ok: "bg-emerald-400",
  error: "bg-red-400",
  info: "bg-amber-400",
};

const Icono = {
  ok: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function Banner({
  tipo = "info",
  className = "",
  children,
}: {
  tipo?: keyof typeof TONO;
  className?: string;
  children: ReactNode;
}) {
  const Icon = Icono[tipo];
  return (
    <div
      className={`mb-5 overflow-hidden rounded-2xl border ${TONO[tipo]} ${className}`}
    >
      <div className={`h-0.5 ${BARRA[tipo]}`} />
      <div className="flex items-start gap-3 px-4 py-3 text-sm">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-90" />
        <div className="min-w-0 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
