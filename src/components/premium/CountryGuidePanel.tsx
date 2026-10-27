"use client";

import type { CountryGuideLite } from "@/lib/premium/country-guides";
import { GlassCard } from "@/components/ui/GlassCard";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/plans/PlanComparison";

interface Props {
  guide: CountryGuideLite;
}

export function CountryGuidePanel({ guide }: Props) {
  const { hasTier } = useSubscription();
  if (!hasTier("plus")) {
    return (
      <UpgradePrompt
        required="plus"
        feature={`${guide.countryName} için uyum rehberi`}
      />
    );
  }

  const isPro = hasTier("pro");

  return (
    <div className="space-y-4">
      <GlassCard title={`${guide.countryName} Rehberi`} subtitle={guide.cultureSnapshot} glow>
        <ul className="space-y-2">
          {guide.tips.map((tip) => (
            <li key={tip} className="flex gap-2 text-sm text-zinc-300">
              <span className="text-accent">→</span>
              {tip}
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard title="Pratik bilgiler" subtitle="Plus">
        <ul className="space-y-1.5 text-xs text-zinc-400">
          {guide.practicalTips.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard title="İlk buluşma fikirleri">
        <div className="flex flex-wrap gap-2">
          {guide.firstDateIdeas.map((idea) => (
            <span key={idea} className="rounded-full border border-zinc-700 px-3 py-1 text-[11px] text-zinc-300">
              {idea}
            </span>
          ))}
        </div>
      </GlassCard>

      {isPro && (
        <>
          <GlassCard title="İletişim & tanışma" subtitle="Pro — tam rehber">
            <p className="text-sm text-zinc-300">{guide.communication}</p>
            <p className="mt-3 text-sm text-zinc-300">{guide.meeting}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {guide.meetingPlaces.map((place) => (
                <span key={place} className="rounded-lg bg-zinc-900/60 px-2 py-1 text-[10px] text-accent-soft">
                  {place}
                </span>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
