"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useEngagement } from "@/hooks/useEngagement";

export function DailyMissionsCard() {
  const { missions } = useEngagement(false);
  const pct = missions.total ? Math.round((missions.doneCount / missions.total) * 100) : 0;

  return (
    <GlassCard title="Bugünün görevleri" subtitle={`${missions.doneCount}/${missions.total} tamamlandı`}>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-2">
        {missions.missions.map((m) => {
          const done = missions.completedIds.includes(m.id);
          return (
            <li
              key={m.id}
              className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-sm ${
                done
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200/90"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-300"
              }`}
            >
              <span>{m.emoji}</span>
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-xs opacity-80">{m.description}</p>
              </div>
              <span className="ml-auto text-xs">{done ? "✓" : "○"}</span>
            </li>
          );
        })}
      </ul>
      <Link href="/journey" className="mt-4 block text-center text-xs text-accent hover:underline">
        Tüm rozetler ve ilerleme →
      </Link>
    </GlassCard>
  );
}
