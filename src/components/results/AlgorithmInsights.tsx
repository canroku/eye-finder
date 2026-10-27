import type { ReasonItem } from "@/lib/types";

const ICONS: Record<string, string> = {
  tall: "📏",
  fitness: "💪",
  travel: "✈️",
  social_men: "🗣️",
  long_relationship: "💍",
  education: "🎓",
  calm_character: "🧘",
  languages: "🌐",
  beard: "🧔",
  sport_style: "🏃",
  art: "🎨",
  nightlife: "🌃",
  technology: "💻",
};

interface Props {
  reasons: ReasonItem[];
  title?: string;
}

export function AlgorithmInsights({ reasons, title = "Algorithm Insights" }: Props) {
  return (
    <div>
      <p className="section-label mb-3">{title}</p>
      <div className="space-y-2">
        {reasons.map((r) => (
          <div
            key={r.trait}
            className="flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-lg">
              {ICONS[r.trait] ?? "✦"}
            </span>
            <span className="flex-1 text-sm text-zinc-200">{r.label}</span>
            <span className="font-mono text-sm font-bold text-emerald-400">
              +{r.contribution}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
