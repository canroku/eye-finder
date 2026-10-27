interface RadarAxis {
  label: string;
  value: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  centerScore: number | null;
  centerLabel?: string;
}

export function RadarChart({
  axes,
  centerScore,
  centerLabel = "Global Eye Score",
}: RadarChartProps) {
  const cx = 160;
  const cy = 160;
  const maxR = 110;
  const levels = [0.25, 0.5, 0.75, 1];
  const n = axes.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, r: number) => {
    const a = angle(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const dataPoints = axes.map((axis, i) =>
    point(i, (axis.value / 100) * maxR),
  );
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <svg viewBox="0 0 320 320" className="w-full">
        {levels.map((lv) => {
          const pts = Array.from({ length: n }, (_, i) => point(i, maxR * lv));
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return (
            <path
              key={lv}
              d={d}
              fill="none"
              stroke="rgba(63,63,70,0.5)"
              strokeWidth="1"
            />
          );
        })}

        {axes.map((_, i) => {
          const p = point(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="rgba(63,63,70,0.4)"
              strokeWidth="1"
            />
          );
        })}

        <path
          d={dataPath}
          fill="rgba(255,107,107,0.18)"
          stroke="#ff6b6b"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ff8585" />
        ))}

        {axes.map((axis, i) => {
          const lp = point(i, maxR + 22);
          return (
            <text
              key={axis.label}
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-400 text-[9px] font-medium"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-[9px] uppercase tracking-wider text-zinc-500">{centerLabel}</p>
        <p className="text-3xl font-bold gradient-text">{centerScore ?? "—"}</p>
      </div>
    </div>
  );
}
