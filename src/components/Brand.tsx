import { Sprout } from "lucide-react";
import { Link } from "react-router-dom";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl border ${
          light
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-emerald-800/60 bg-emerald-950 text-emerald-300"
        }`}
      >
        <Sprout className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-lg font-semibold tracking-tight text-white">
          AgroTrace <span className="text-emerald-400">360</span>
        </span>
        <span className="block text-[11px] uppercase tracking-[0.18em] text-stone-400 max-sm:hidden">
          Del árbol al contenedor
        </span>
      </span>
    </Link>
  );
}
