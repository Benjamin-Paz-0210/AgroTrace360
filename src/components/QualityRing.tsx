export function QualityRing({ value }: { value: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const tone = value >= 85 ? "#34d399" : value >= 75 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative grid h-32 w-32 place-items-center sm:h-40 sm:w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#1c2a22"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="12"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-serif text-4xl text-white">{value}</p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">
          % exportable
        </p>
      </div>
    </div>
  );
}
