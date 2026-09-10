import type { ProcessStep } from "../data/mock";
import { Check, Circle, Lock, Loader } from "lucide-react";

export function ProcessStepper({ pasos }: { pasos: ProcessStep[] }) {
  return (
    <ol className="grid grid-cols-2 gap-3 md:grid-cols-6">
      {pasos.map((paso, index) => (
        <li
          key={paso.id}
          className={`rounded-2xl border p-4 ${
            paso.status === "en_curso"
              ? "border-emerald-500/40 bg-emerald-950/40"
              : "border-white/8 bg-white/3"
          }`}
        >
          <div className="mb-3 flex items-center justify-between text-emerald-400">
            <span className="font-mono text-[11px]">0{index + 1}</span>
            {paso.status === "hecho" ? (
              <Check className="h-4 w-4" />
            ) : paso.status === "en_curso" ? (
              <Loader className="h-4 w-4" />
            ) : paso.status === "bloqueado" ? (
              <Lock className="h-4 w-4 text-amber-400" />
            ) : (
              <Circle className="h-4 w-4 text-stone-600" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-white">{paso.label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-400">
            {paso.detail}
          </p>
        </li>
      ))}
    </ol>
  );
}
