import type { CountryCompatibility, CountryResult, UserProfile } from "@/lib/types";
import { getCountryIntel, buildPersonalizedStarters } from "@/lib/data/country-intelligence";
import { getClusterForCountry } from "@/lib/data/clusters";
import { getTopAppForCountry } from "@/lib/data/country-apps";

export interface CountryInsightBundle {
  intel: ReturnType<typeof getCountryIntel>;
  strongestDimension: { label: string; value: number };
  weakestDimension: { label: string; value: number };
  matchSummary: string;
  personalizedStarters: string[];
  homeContrast?: string;
}

const DIM_LABELS: Record<keyof Omit<CountryCompatibility, "countryCode" | "countryName" | "clusterId" | "affinity">, string> = {
  physical: "Fiziksel",
  lifestyle: "Yaşam",
  personality: "Kişilik",
  relationship: "İlişki",
  social: "Sosyal",
};

export function buildCountryInsights(
  country: CountryResult,
  profile: UserProfile | null,
  homeCode?: string,
): CountryInsightBundle {
  const { compatibility } = country;
  const intel = getCountryIntel(compatibility.countryCode, compatibility.countryName);
  const dims = (
    ["physical", "lifestyle", "personality", "relationship", "social"] as const
  ).map((k) => ({ key: k, label: DIM_LABELS[k], value: compatibility[k] }));

  const sorted = [...dims].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const cluster = getClusterForCountry(compatibility.countryCode);
  const topApp = getTopAppForCountry(compatibility.countryCode);

  let matchSummary = `${compatibility.countryName}'de en güçlü uyumun ${strongest.label.toLowerCase()} boyutunda (%${strongest.value}). `;
  matchSummary += `${cluster.name} kültüründe ${intel.datingPace} tempo beklenir.`;
  if (topApp) matchSummary += ` En aktif kanal: ${topApp.name}.`;

  let homeContrast: string | undefined;
  if (homeCode && homeCode !== compatibility.countryCode) {
    const homeIntel = getCountryIntel(homeCode);
    homeContrast = `${homeIntel.name} → ${intel.name}: iletişim ${homeIntel.datingDirectness > intel.datingDirectness ? "daha doğrudan" : "daha kademeli"}, İngilizce seviyesi ${intel.englishLevel}/10.`;
  }

  return {
    intel,
    strongestDimension: strongest,
    weakestDimension: weakest,
    matchSummary,
    personalizedStarters: buildPersonalizedStarters(intel, profile?.demographics?.city),
    homeContrast,
  };
}

export function compareCountries(a: CountryResult, b: CountryResult) {
  const dims = ["physical", "lifestyle", "personality", "relationship", "social"] as const;
  return dims.map((key) => ({
    key,
    label: DIM_LABELS[key],
    a: a.compatibility[key],
    b: b.compatibility[key],
    diff: a.compatibility[key] - b.compatibility[key],
  }));
}
