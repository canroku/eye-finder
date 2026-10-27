"use client";

import type { SubscriptionTier } from "@/lib/subscription/tiers";

const STYLES: Record<SubscriptionTier, string> = {
  free: "tier-free",
  plus: "tier-plus",
  pro: "tier-pro",
};

const LABELS: Record<SubscriptionTier, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
};

export function TierBadge({ tier, className = "" }: { tier: SubscriptionTier; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[tier]} ${className}`}
    >
      {LABELS[tier]}
    </span>
  );
}
