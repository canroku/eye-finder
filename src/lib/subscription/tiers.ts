export type SubscriptionTier = "free" | "plus" | "pro";

export const TIER_ORDER: SubscriptionTier[] = ["free", "plus", "pro"];

export interface TierLimits {
  maxPhotos: number;
  maxCountries: number;
  onboardingModes: ("quick" | "standard" | "deep")[];
  exportPdf: boolean;
  exportPng: boolean;
  fullArchetype: boolean;
  profileComparison: boolean;
  countryGuide: "none" | "lite" | "full";
  socialActionPlan: boolean;
  weeklyPlan: boolean;
  globalLearning: boolean;
  earlyAccess: boolean;
}

export interface TierPlan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  priceMonthly: string;
  priceYearly: string;
  badge?: string;
  highlighted?: boolean;
  limits: TierLimits;
  features: string[];
}

const FREE_LIMITS: TierLimits = {
  maxPhotos: 3,
  maxCountries: 5,
  onboardingModes: ["quick"],
  exportPdf: false,
  exportPng: false,
  fullArchetype: false,
  profileComparison: false,
  countryGuide: "none",
  socialActionPlan: false,
  weeklyPlan: false,
  globalLearning: false,
  earlyAccess: false,
};

const PLUS_LIMITS: TierLimits = {
  maxPhotos: 8,
  maxCountries: 15,
  onboardingModes: ["quick", "standard"],
  exportPdf: false,
  exportPng: true,
  fullArchetype: true,
  profileComparison: true,
  countryGuide: "lite",
  socialActionPlan: false,
  weeklyPlan: false,
  globalLearning: true,
  earlyAccess: false,
};

const PRO_LIMITS: TierLimits = {
  maxPhotos: 15,
  maxCountries: 999,
  onboardingModes: ["quick", "standard", "deep"],
  exportPdf: true,
  exportPng: true,
  fullArchetype: true,
  profileComparison: true,
  countryGuide: "full",
  socialActionPlan: true,
  weeklyPlan: true,
  globalLearning: true,
  earlyAccess: true,
};

export const ADMIN_LIMITS: TierLimits = {
  maxPhotos: 999,
  maxCountries: 999,
  onboardingModes: ["quick", "standard", "deep"],
  exportPdf: true,
  exportPng: true,
  fullArchetype: true,
  profileComparison: true,
  countryGuide: "full",
  socialActionPlan: true,
  weeklyPlan: true,
  globalLearning: true,
  earlyAccess: true,
};

export const TIER_PLANS: TierPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Keşfetmeye başla",
    priceMonthly: "₺0",
    priceYearly: "₺0",
    limits: FREE_LIMITS,
    features: [
      "Hızlı analiz (16 soru)",
      "3 fotoğraf",
      "Top 5 ülke",
      "Kısa arketip özeti",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "Daha derin uyum haritası",
    priceMonthly: "₺99",
    priceYearly: "₺899",
    badge: "Popüler",
    highlighted: true,
    limits: PLUS_LIMITS,
    features: [
      "Standart analiz (20 soru)",
      "8 fotoğraf + PNG rapor",
      "Top 15 ülke + harita (209 ülke havuzu)",
      "Ülke uyum rehberi (lite)",
      "Global öğrenme",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Hedef ülkende nasıl buluşursun?",
    priceMonthly: "₺249",
    priceYearly: "₺2.399",
    badge: "Tam erişim",
    limits: PRO_LIMITS,
    features: [
      "Derin analiz (80 soru)",
      "15 fotoğraf + PDF/PNG",
      "209 ülke + tam rehber",
      "Kişisel sosyal aksiyon planı",
      "7 günlük hedef plan + erken erişim",
      "Herhangi bir ülke için ulaşım rehberi",
    ],
  },
];

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_PLANS.find((p) => p.id === tier)?.limits ?? FREE_LIMITS;
}

export function getTierPlan(tier: SubscriptionTier): TierPlan {
  return TIER_PLANS.find((p) => p.id === tier) ?? TIER_PLANS[0];
}

export function tierAtLeast(current: SubscriptionTier, required: SubscriptionTier): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
}

export function resolveTierLimits(tier: SubscriptionTier, isAdmin = false): TierLimits {
  if (isAdmin) return ADMIN_LIMITS;
  return getTierLimits(tier);
}

export function resolveHasTier(
  tier: SubscriptionTier,
  required: SubscriptionTier,
  isAdmin = false,
): boolean {
  if (isAdmin) return true;
  return tierAtLeast(tier, required);
}
