"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useEngagement } from "@/hooks/useEngagement";

export function AchievementsGrid({ compact = false }: { compact?: boolean }) {
  const { achievements } = useEngagement(false);
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <GlassCard
      title="Rozetler"
      subtitle={`${unlocked}/${achievements.length} açıldı`}
      glow={unlocked >= 5}
    >
      <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"}`}>
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-3 text-center transition ${
              a.unlocked
                ? "border-accent-border bg-accent-dim/50"
                : "border-zinc-800 bg-zinc-900/30 opacity-50 grayscale"
            }`}
          >
            <span className="text-2xl">{a.emoji}</span>
            <p className="mt-1 text-[11px] font-semibold text-white">{a.title}</p>
            {!compact && <p className="mt-0.5 text-[10px] text-zinc-500">{a.description}</p>}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
