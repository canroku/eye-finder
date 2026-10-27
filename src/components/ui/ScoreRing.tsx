interface ScoreRingProps {
  score: number | null;
  label: string;
  size?: "sm" | "lg";
}

export function ScoreRing({ score, label, size = "sm" }: ScoreRingProps) {
  const display = score ?? "--";
  const pct = score ?? 0;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;
  const dim = size === "lg" ? "h-40 w-40" : "h-24 w-24";
  const textSize = size === "lg" ? "text-4xl" : "text-xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${dim}`}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-zinc-800"
          />
          {score !== null && (
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-accent transition-all duration-1000"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-white ${textSize}`}>{display}</span>
        </div>
      </div>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}
