const REGION_DOTS: Record<string, { x: number; y: number }> = {
  BR: { x: 72, y: 68 },
  CO: { x: 68, y: 58 },
  AR: { x: 70, y: 78 },
  CL: { x: 68, y: 82 },
  MX: { x: 58, y: 52 },
  PL: { x: 52, y: 38 },
  RU: { x: 58, y: 32 },
  UA: { x: 54, y: 40 },
  TR: { x: 54, y: 46 },
  IT: { x: 50, y: 44 },
  ES: { x: 46, y: 44 },
  GR: { x: 52, y: 46 },
  RS: { x: 52, y: 42 },
  HR: { x: 50, y: 42 },
  SE: { x: 50, y: 32 },
  NO: { x: 48, y: 28 },
  US: { x: 42, y: 48 },
  GB: { x: 46, y: 36 },
  AU: { x: 78, y: 72 },
  CA: { x: 40, y: 38 },
  JP: { x: 82, y: 46 },
  KR: { x: 80, y: 44 },
  TH: { x: 76, y: 54 },
  PH: { x: 80, y: 52 },
};

interface Props {
  countryCode: string;
  countryName: string;
}

export function MiniRegionMap({ countryCode, countryName }: Props) {
  const dot = REGION_DOTS[countryCode] ?? { x: 50, y: 50 };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/80 p-3">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Bölge Haritası</p>
      <svg viewBox="0 0 100 60" className="h-24 w-full">
        <ellipse cx="50" cy="30" rx="48" ry="28" fill="rgba(39,39,42,0.8)" stroke="rgba(63,63,70,0.5)" />
        {Object.entries(REGION_DOTS).map(([code, p]) => (
          <circle
            key={code}
            cx={p.x}
            cy={p.y}
            r={code === countryCode ? 0 : 1.2}
            fill="rgba(113,113,122,0.4)"
          />
        ))}
        <circle cx={dot.x} cy={dot.y} r="4" fill="#f59e0b" opacity="0.9">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={dot.x} cy={dot.y} r="8" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
      </svg>
      <p className="mt-1 text-center text-xs text-accent/80">{countryName}</p>
    </div>
  );
}
