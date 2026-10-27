"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useEngagement } from "@/hooks/useEngagement";

export function StreakCard() {
  const { state } = useEngagement(false);

  if (state.streak < 1 && state.totalVisits < 2) return null;

  return (
    <GlassCard glow className="border-accent-dim">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Günlük seri</p>
          <p className="text-2xl font-bold text-white">
            {state.streak} <span className="text-base font-normal text-zinc-400">gün</span>
          </p>
          <p className="text-xs text-zinc-500">
            En uzun: {state.longestStreak} gün · {state.totalVisits} ziyaret
          </p>
        </div>
        <span className="text-3xl" aria-hidden>
          {state.streak >= 7 ? "⚡" : state.streak >= 3 ? "🔥" : "✨"}
        </span>
      </div>
    </GlassCard>
  );
}
