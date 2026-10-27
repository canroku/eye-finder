import type { CountryMatrixEntry } from "@/lib/types";
import { CULTURAL_CLUSTERS } from "@/lib/data/clusters";
import { COUNTRY_REGISTRY, COUNTRY_REGISTRY_COUNT } from "@/lib/data/country-registry";
import { flagEmoji } from "@/lib/data/flag-emoji";

function buildFromRegistry(
  entry: (typeof COUNTRY_REGISTRY)[number],
): CountryMatrixEntry {
  const cluster = CULTURAL_CLUSTERS.find((c) => c.id === entry.clusterId)!;
  return {
    code: entry.code,
    name: entry.name,
    clusterId: entry.clusterId,
    flag: flagEmoji(entry.code),
    weights: {
      social_men: 5,
      fitness: 5,
      tall: 5,
      travel: 5,
      long_relationship: 5,
      education: 5,
      calm_character: 5,
      languages: 5,
      beard: 3,
      sport_style: 4,
      ...entry.weightOverrides,
    },
    lifestyleWeights: { ...cluster.lifestyleWeights },
    relationshipWeights: { ...cluster.relationshipWeights },
  };
}

export const COUNTRY_MATRIX: CountryMatrixEntry[] = COUNTRY_REGISTRY.map(buildFromRegistry);

export const COUNTRY_COUNT = COUNTRY_REGISTRY_COUNT;

export const TOP_COUNTRY_LIMIT = 15;

export const TRAIT_LABELS: Record<string, string> = {
  social_men: "Sosyal yaşam tarzı",
  fitness: "Spor ve fitness",
  tall: "Uzun boy",
  travel: "Seyahat tutkusu",
  long_relationship: "Uzun ilişki isteği",
  education: "Eğitim seviyesi",
  calm_character: "Sakin karakter",
  languages: "Dil bilgisi",
  beard: "Sakal stili",
  sport_style: "Spor stili",
  art: "Sanat ilgisi",
  nightlife: "Gece hayatı",
  family_oriented: "Aile odaklılık",
  technology: "Teknoloji ilgisi",
  conscientious: "Disiplinli karakter",
};
