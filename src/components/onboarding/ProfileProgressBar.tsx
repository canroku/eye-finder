"use client";

interface Props {
  step: number;
  totalSteps: number;
  photos?: { current: number; required: number };
  labels?: string[];
}

export function ProfileProgressBar({
  step,
  totalSteps,
  photos,
  labels = ["Personality Vector", "Lifestyle Labels"],
}: Props) {
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="glass-card mb-6 space-y-3 p-4">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted">
        <span>Profil kurulumu</span>
        <span className="gradient-text">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/25">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent via-accent-hover to-accent-secondary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {photos && (
        <div className="flex justify-between text-xs text-secondary">
          <span>Fotoğraflar</span>
          <span>
            {photos.current}/{photos.required}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {labels.map((l) => (
          <span
            key={l}
            className="rounded-full border border-accent-border bg-accent-dim px-2.5 py-0.5 text-[10px] font-medium text-accent-soft"
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
