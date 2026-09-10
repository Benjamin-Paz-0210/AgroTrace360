import { TIPO_LABEL, type BitacoraEntry } from "../data/mock";

export function BitacoraTimeline({
  entries,
  compact = false,
}: {
  entries: BitacoraEntry[];
  compact?: boolean;
}) {
  const ordered = [...entries].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  return (
    <ol className="relative space-y-4 border-l border-emerald-900/70 pl-5">
      {ordered.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <p className="font-mono text-[11px] text-stone-500">
            {entry.fecha} · {TIPO_LABEL[entry.tipo] ?? entry.tipo} · {entry.autor}
          </p>
          <h4 className="text-sm font-semibold text-white">{entry.titulo}</h4>
          {compact ? null : (
            <p className="mt-1 text-sm text-stone-400">{entry.nota}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
