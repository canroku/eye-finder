"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StreakCard } from "@/components/engagement/StreakCard";
import { DailyMissionsCard } from "@/components/engagement/DailyMissionsCard";
import { DailyInsightCard } from "@/components/engagement/DailyInsightCard";
import { DreamCountriesCard } from "@/components/engagement/DreamCountriesCard";
import { AchievementsGrid } from "@/components/engagement/AchievementsGrid";
import { GlassCard } from "@/components/ui/GlassCard";
import { useEngagement } from "@/hooks/useEngagement";
import { completeDailyMission } from "@/lib/engagement/store";

export default function JourneyPage() {
  const { state } = useEngagement(true);

  useEffect(() => {
    completeDailyMission("check_journey");
  }, []);

  return (
    <div className="page-stack animate-fade-in pt-2">
      <PageHeader
        label="Bağlılık"
        title="Yolculuğun"
        highlight="Yolculuğun"
        subtitle="Günlük görevler, seriler ve rozetlerle keşfine devam et"
      />

      <StreakCard />

      <GlassCard title="İstatistiklerin">
        <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
          {[
            ["Analiz", state.stats.analysesCompleted],
            ["Ülke inceleme", state.stats.countriesViewed],
            ["Karşılaştırma", state.stats.comparisonsDone],
            ["Paylaşım", state.stats.sharesDone],
          ].map(([label, val]) => (
            <div key={label as string} className="rounded-xl border border-accent-border/30 bg-accent-dim p-3">
              <p className="text-muted">{label}</p>
              <p className="text-lg font-bold gradient-text">{val as number}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <DailyMissionsCard />
      <DailyInsightCard />
      <DreamCountriesCard />
      <AchievementsGrid />

      <div className="grid gap-2 sm:grid-cols-2">
        <Link href="/onboarding" className="btn-primary text-center">
          Yeni analiz
        </Link>
        <Link href="/results" className="btn-secondary text-center">
          Sonuçlarım
        </Link>
      </div>
    </div>
  );
}
