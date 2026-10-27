"use client";

import type { SocialActionPlan } from "@/lib/premium/country-guides";
import { GlassCard } from "@/components/ui/GlassCard";
import { UpgradePrompt } from "@/components/plans/PlanComparison";
import { useSubscription } from "@/hooks/useSubscription";

export function SocialActionPlanPanel({ plan }: { plan: SocialActionPlan }) {
  const { hasTier } = useSubscription();
  if (!hasTier("pro")) {
    return (
      <UpgradePrompt
        required="pro"
        feature={`${plan.countryName}'de insanlarla nasıl tanışırsın?`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard title="Sosyal Aksiyon Planı" subtitle="Pro exclusive" glow>
        <p className="text-lg font-semibold text-white">{plan.headline}</p>
      </GlassCard>

      <GlassCard title="Tanışma kanalları">
        <div className="space-y-3">
          {plan.channels.map((c) => (
            <div key={c.title} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
              <p className="text-sm font-semibold text-accent-soft">{c.title}</p>
              <p className="mt-1 text-xs text-zinc-400">{c.detail}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="İlk mesaj şablonları">
        <ul className="space-y-2">
          {plan.messageTemplates.map((t) => (
            <li key={t} className="rounded-xl bg-zinc-900/60 p-3 text-xs text-zinc-300">
              “{t}”
            </li>
          ))}
        </ul>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard title="Green flags">
          <ul className="space-y-1 text-xs text-emerald-400/90">
            {plan.greenFlags.map((f) => (
              <li key={f}>+ {f}</li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard title="Red flags">
          <ul className="space-y-1 text-xs text-red-400/90">
            {plan.redFlags.map((f) => (
              <li key={f}>− {f}</li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard title="7 günlük plan">
        <div className="space-y-2">
          {plan.weeklyPlan.map((d) => (
            <div key={d.day} className="flex gap-3 text-xs">
              <span className="w-8 shrink-0 font-bold text-accent">{d.day}</span>
              <span className="text-zinc-400">{d.action}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Profil optimizasyonu">
        <ul className="space-y-2">
          {plan.profileTips.map((t) => (
            <li key={t} className="flex gap-2 text-xs text-zinc-300">
              <span className="text-accent">✓</span>
              {t}
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard title="Alternatif stratejiler">
        <ul className="space-y-1 text-xs text-zinc-400">
          {plan.alternatives.map((a) => (
            <li key={a}>→ {a}</li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
