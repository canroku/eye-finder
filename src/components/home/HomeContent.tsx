"use client";

import Link from "next/link";
import { HomeStatus } from "@/components/home/HomeStatus";
import { TierBadge } from "@/components/plans/TierBadge";
import { StreakCard } from "@/components/engagement/StreakCard";
import { DailyMissionsCard } from "@/components/engagement/DailyMissionsCard";
import { DailyInsightCard } from "@/components/engagement/DailyInsightCard";
import { IconGlobe, IconHeart, IconSpark } from "@/components/ui/NavIcons";
import { useAuth } from "@/contexts/AuthProvider";
import { useEngagement } from "@/hooks/useEngagement";

export function HomeContent() {
  const { user, tier } = useAuth();
  const { missions } = useEngagement(true);
  const name = user?.isGuest ? "Misafir" : user?.email?.split("@")[0];
  const missionPct = missions.total
    ? Math.round((missions.doneCount / missions.total) * 100)
    : 0;

  return (
    <div className="page-stack animate-fade-in">
      <HomeStatus />
      <StreakCard />

      {missions.total > 0 && missions.doneCount < missions.total && (
        <Link
          href="/journey"
          className="glass-card block border-accent-border bg-accent-dim px-4 py-3.5 transition hover:bg-accent-dim-strong"
        >
          <div className="flex items-center gap-2">
            <IconSpark className="h-4 w-4 text-accent" />
            <p className="text-xs font-semibold text-accent-soft">
              Bugün {missions.total - missions.doneCount} görev seni bekliyor
            </p>
            <span className="ml-auto text-accent">→</span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary transition-all"
              style={{ width: `${missionPct}%` }}
            />
          </div>
        </Link>
      )}

      <section className="hero-block">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label">Eye Finder</p>
          <TierBadge tier={tier} />
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-white lg:text-3xl">
          Küresel ilgi haritanı{" "}
          <span className="gradient-text">keşfet</span>
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary">
          {name
            ? `Merhaba ${name} — günlük görevleri tamamla, serini koru.`
            : "Profiline göre hangi ülkelerde daha yüksek uyum skoru alacağını öğren."}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/onboarding" className="btn-primary text-center">
            <IconHeart className="h-4 w-4" />
            Analize başla
          </Link>
          <Link href="/results" className="btn-secondary text-center">
            <IconGlobe className="h-4 w-4" />
            Sonuçlarım
          </Link>
        </div>
      </section>

      <DailyInsightCard />
      <DailyMissionsCard />

      <section>
        <p className="section-label mb-3">Plan özellikleri</p>
        <div className="feature-grid">
          {[
            { t: "Eye Score", d: "Küresel ilgi skoru", tier: "free" as const },
            { t: "Harita", d: "Ülke uyum görselleştirme", tier: "free" as const },
            { t: "Plus rehber", d: "Kültürel ipuçları", tier: "plus" as const },
            { t: "Pro plan", d: "Tanışma stratejisi", tier: "pro" as const },
          ].map((item) => (
            <div key={item.t} className="feature-tile">
              <TierBadge tier={item.tier} className="mb-2" />
              <p className="text-sm font-semibold text-white">{item.t}</p>
              <p className="mt-1 text-xs text-muted">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Link href="/journey" className="quick-link border-accent-border">
          <div>
            <p className="text-sm font-semibold text-white">Yolculuğum</p>
            <p className="text-xs text-muted">Görevler, rozetler, hayal ülkeler</p>
          </div>
          <span className="text-accent">→</span>
        </Link>
        <Link href="/plans" className="quick-link">
          <div>
            <p className="text-sm font-semibold text-white">Planını yükselt</p>
            <p className="text-xs text-muted">Plus ve Pro özellikleri</p>
          </div>
          <span className="text-accent">→</span>
        </Link>
        <Link href="/account" className="quick-link">
          <div>
            <p className="text-sm font-semibold text-white">Hesap & abonelik</p>
            <p className="text-xs text-muted">Oturum ve plan yönetimi</p>
          </div>
          <span className="text-secondary">→</span>
        </Link>
      </section>
    </div>
  );
}
