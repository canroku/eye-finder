import type { ClusterProfile } from "@/lib/types";
import { getRegistryEntry } from "@/lib/data/country-registry";

export const CULTURAL_CLUSTERS: ClusterProfile[] = [
  {
    id: "latin",
    name: "Latin Kümesi",
    countries: ["BR", "CO", "AR", "CL", "MX", "PE", "EC", "UY", "VE", "PA", "CR", "DO", "BO", "PY", "GT", "SN", "CI"],
    relationshipWeights: {
      marriage: 0.6,
      longTerm: 0.75,
      shortTerm: 0.55,
      friendship: 0.4,
    },
    lifestyleWeights: {
      fitness: 85,
      travel: 80,
      gaming: 35,
      books: 45,
      nightlife: 75,
      art: 60,
      film: 65,
      technology: 50,
      homeLife: 40,
    },
    socialExpectations: {
      extroversion: 78,
      education: 55,
      languages: 45,
      fitness: 80,
    },
  },
  {
    id: "slav",
    name: "Slav Kümesi",
    countries: ["RU", "UA", "BY", "PL", "CZ", "SK", "MD", "KZ", "UZ", "AM", "MN"],
    relationshipWeights: {
      marriage: 0.85,
      longTerm: 0.9,
      shortTerm: 0.3,
      friendship: 0.35,
    },
    lifestyleWeights: {
      fitness: 55,
      travel: 50,
      gaming: 45,
      books: 70,
      nightlife: 40,
      art: 55,
      film: 60,
      technology: 55,
      homeLife: 65,
    },
    socialExpectations: {
      extroversion: 45,
      education: 75,
      languages: 60,
      fitness: 50,
    },
  },
  {
    id: "balkan",
    name: "Balkan Kümesi",
    countries: ["RS", "ME", "BA", "HR", "BG", "MK", "RO", "SI", "AL", "GE", "AZ"],
    relationshipWeights: {
      marriage: 0.8,
      longTerm: 0.85,
      shortTerm: 0.45,
      friendship: 0.5,
    },
    lifestyleWeights: {
      fitness: 60,
      travel: 55,
      gaming: 40,
      books: 55,
      nightlife: 65,
      art: 50,
      film: 55,
      technology: 45,
      homeLife: 55,
    },
    socialExpectations: {
      extroversion: 65,
      education: 60,
      languages: 50,
      fitness: 55,
    },
  },
  {
    id: "mediterranean",
    name: "Akdeniz Kümesi",
    countries: ["TR", "IT", "ES", "GR", "PT", "CY", "FR", "TH", "MY", "IN", "EG", "PK", "BD", "LK", "NP", "MM", "KH", "LA", "AE", "SA", "QA", "IL", "JO", "LB", "MA", "TN", "DZ", "ET"],
    relationshipWeights: {
      marriage: 0.75,
      longTerm: 0.8,
      shortTerm: 0.5,
      friendship: 0.45,
    },
    lifestyleWeights: {
      fitness: 65,
      travel: 75,
      gaming: 30,
      books: 60,
      nightlife: 70,
      art: 70,
      film: 65,
      technology: 45,
      homeLife: 50,
    },
    socialExpectations: {
      extroversion: 70,
      education: 65,
      languages: 55,
      fitness: 60,
    },
  },
  {
    id: "nordic",
    name: "Kuzey Avrupa Kümesi",
    countries: ["SE", "NO", "FI", "DK", "IS", "NL", "JP", "KR", "CN", "TW", "HK", "SG", "VN", "LT", "LV", "EE", "CH"],
    relationshipWeights: {
      marriage: 0.7,
      longTerm: 0.85,
      shortTerm: 0.35,
      friendship: 0.55,
    },
    lifestyleWeights: {
      fitness: 75,
      travel: 70,
      gaming: 50,
      books: 80,
      nightlife: 45,
      art: 65,
      film: 70,
      technology: 75,
      homeLife: 70,
    },
    socialExpectations: {
      extroversion: 50,
      education: 85,
      languages: 80,
      fitness: 70,
    },
  },
  {
    id: "anglo",
    name: "Anglo Kümesi",
    countries: ["US", "GB", "AU", "CA", "NZ", "IE", "DE", "AT", "BE", "LU", "ZA", "NG", "KE", "GH", "TZ", "UG", "RW", "CM"],
    relationshipWeights: {
      marriage: 0.65,
      longTerm: 0.75,
      shortTerm: 0.55,
      friendship: 0.6,
    },
    lifestyleWeights: {
      fitness: 70,
      travel: 72,
      gaming: 55,
      books: 65,
      nightlife: 60,
      art: 55,
      film: 75,
      technology: 80,
      homeLife: 55,
    },
    socialExpectations: {
      extroversion: 65,
      education: 75,
      languages: 70,
      fitness: 65,
    },
  },
];

export function getClusterNameById(clusterId: string): string {
  const cluster = CULTURAL_CLUSTERS.find((c) => c.id === clusterId);
  return cluster?.name.replace(" Kümesi", "") ?? "Küresel";
}

export function getClusterForCountry(countryCode: string): ClusterProfile {
  const registry = getRegistryEntry(countryCode);
  if (registry) {
    return CULTURAL_CLUSTERS.find((c) => c.id === registry.clusterId) ?? CULTURAL_CLUSTERS[0];
  }
  return (
    CULTURAL_CLUSTERS.find((c) => c.countries.includes(countryCode)) ??
    CULTURAL_CLUSTERS.find((c) => c.id === "anglo") ??
    CULTURAL_CLUSTERS[0]
  );
}
