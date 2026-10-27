"use client";

import type { SubscriptionTier } from "@/lib/subscription/tiers";
import { resolveHasTier, resolveTierLimits } from "@/lib/subscription/tiers";
import { TIER_CHANGED_EVENT } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/auth/session-client";

let cachedUser: AuthUser | null = null;

export function setCachedAuthUser(user: AuthUser | null): void {
  cachedUser = user;
}

export function getCachedAuthUser(): AuthUser | null {
  return cachedUser;
}

export function getCurrentTier(): SubscriptionTier {
  return cachedUser?.tier ?? "free";
}

export function getLimits() {
  return resolveTierLimits(getCurrentTier(), cachedUser?.isAdmin === true);
}

export function hasTier(required: SubscriptionTier): boolean {
  return resolveHasTier(getCurrentTier(), required, cachedUser?.isAdmin === true);
}

export function subscribeTier(cb: () => void): () => void {
  window.addEventListener(TIER_CHANGED_EVENT, cb);
  window.addEventListener("eye-finder-auth-changed", cb);
  return () => {
    window.removeEventListener(TIER_CHANGED_EVENT, cb);
    window.removeEventListener("eye-finder-auth-changed", cb);
  };
}

/** @deprecated use getCurrentTier + hasTier('plus') */
export function isPremiumUser(): boolean {
  return hasTier("plus");
}

/** @deprecated */
export function getPremiumFeatures() {
  const limits = getLimits();
  return {
    unlimitedPhotos: limits.maxPhotos >= 15,
    detailedCountryReport: limits.countryGuide !== "none",
    profileComparison: limits.profileComparison,
    exportPdf: limits.exportPdf,
  };
}

export const MAX_PHOTOS_FREE = 3;
export const MAX_PHOTOS_PLUS = 8;
export const MAX_PHOTOS_PRO = 15;

export function getMaxPhotos(): number {
  return getLimits().maxPhotos;
}

export function getMaxCountries(): number {
  return getLimits().maxCountries;
}
