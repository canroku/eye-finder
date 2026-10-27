"use client";

import Link from "next/link";
import { TIER_PLANS, type SubscriptionTier } from "@/lib/subscription/tiers";
import { TierBadge } from "@/components/plans/TierBadge";

interface Props {
  currentTier: SubscriptionTier;
  onSelect: (tier: SubscriptionTier) => void;
  loadingTier?: SubscriptionTier | null;
}

export function PlanComparison({ currentTier, onSelect, loadingTier }: Props) {
  return (
    <div className="plan-scroll">
      {TIER_PLANS.map((plan) => {
        const active = currentTier === plan.id;
        const loading = loadingTier === plan.id;
        return (
          <article
            key={plan.id}
            className={`plan-card ${plan.highlighted ? "plan-card-featured" : ""} ${active ? "plan-card-current" : ""}`}
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <TierBadge tier={plan.id} />
                <h3 className="mt-3 text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted">{plan.tagline}</p>
              </div>
              {plan.badge && (
                <span className="rounded-full bg-accent-dim px-2 py-0.5 text-[10px] font-semibold text-accent">
                  {plan.badge}
                </span>
              )}
            </div>

            <p className="text-3xl font-semibold tracking-tight text-white">
              {plan.priceMonthly}
              <span className="ml-1 text-sm font-normal text-muted">/ay</span>
            </p>
            <p className="mb-5 mt-1 text-xs text-muted">Yıllık {plan.priceYearly}</p>

            <ul className="mb-6 flex-1 space-y-2.5 border-t border-white/5 pt-4">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-xs leading-relaxed text-secondary">
                  <span className="mt-0.5 text-accent" aria-hidden>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={loading || active}
              onClick={() => onSelect(plan.id)}
              className={active ? "btn-secondary" : "btn-primary"}
            >
              {loading
                ? "Güncelleniyor…"
                : active
                  ? "Aktif plan"
                  : plan.id === "free"
                    ? "Free ile devam"
                    : `${plan.name} seç`}
            </button>
          </article>
        );
      })}
    </div>
  );
}

export function UpgradePrompt({
  required,
  feature,
}: {
  required: SubscriptionTier;
  feature: string;
}) {
  return (
    <div className="upgrade-prompt">
      <p className="text-sm font-medium text-white">{feature}</p>
      <p className="mt-2 text-xs text-muted">
        Bu özellik <TierBadge tier={required} className="mx-1 inline-flex align-middle" /> planında
        açılır.
      </p>
      <Link href="/plans" className="btn-primary mt-4 inline-flex text-sm">
        Planı yükselt
      </Link>
    </div>
  );
}
