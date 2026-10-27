"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { resolveHasTier, resolveTierLimits, type SubscriptionTier } from "@/lib/subscription/tiers";

export function useSubscription() {
  const { tier, user } = useAuth();
  const isAdmin = user?.isAdmin === true;
  const limits = resolveTierLimits(tier, isAdmin);
  return {
    tier,
    limits,
    isAdmin,
    hasTier: (required: SubscriptionTier) => resolveHasTier(tier, required, isAdmin),
  };
}
