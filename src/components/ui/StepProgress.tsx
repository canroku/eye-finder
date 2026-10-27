interface StepProgressProps {
  steps: string[];
  current: number;
}

export function StepProgress({ steps, current }: StepProgressProps) {
  const pct = ((current + 1) / steps.length) * 100;

  return (
    <div className="mb-6">
      <div className="mb-2 flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
        <span>
          Adım {current + 1}/{steps.length}
        </span>
        <span className="text-accent">{steps[current]}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between gap-1">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition ${
              i <= current ? "bg-accent" : "bg-zinc-800"
            }`}
            title={step}
          />
        ))}
      </div>
    </div>
  );
}
