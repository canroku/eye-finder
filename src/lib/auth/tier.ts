import type { SubscriptionTier } from "@/lib/subscription/tiers";
import type { StoredUser } from "@/lib/auth/store";

export function resolveEffectiveTier(user: StoredUser): SubscriptionTier {
  if (user.role === "admin") return user.tier;
  if (user.tier === "free") return "free";
  if (!user.tierExpiresAt) return user.tier;
  if (new Date(user.tierExpiresAt).getTime() > Date.now()) return user.tier;
  return "free";
}

export function isTierExpired(user: StoredUser): boolean {
  if (user.tier === "free" || user.role === "admin") return false;
  if (!user.tierExpiresAt) return false;
  return new Date(user.tierExpiresAt).getTime() <= Date.now();
}
