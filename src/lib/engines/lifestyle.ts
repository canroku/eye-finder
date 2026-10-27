import type { LifestyleSelfReport, LifestyleVector, PersonalityProfile } from "@/lib/types";

export function buildLifestyleVector(
  lifestyle: LifestyleSelfReport,
  personality: PersonalityProfile | null,
): LifestyleVector {
  const opennessBoost = personality ? personality.openness / 100 : 0.5;

  return {
    fitness: Math.round(lifestyle.sport * 0.85 + opennessBoost * 15),
    travel: Math.round(lifestyle.travel * 0.85 + opennessBoost * 100 * 0.15),
    gaming: lifestyle.gaming,
    books: Math.round(lifestyle.books * 0.9 + opennessBoost * 10),
    nightlife: lifestyle.nightlife,
    art: Math.round(lifestyle.art * 0.85 + opennessBoost * 15),
    film: lifestyle.film,
    technology: lifestyle.technology,
    homeLife: lifestyle.homeLife,
  };
}

export function computeLifestyleScore(vector: LifestyleVector): number {
  const values = Object.values(vector);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function cosineSimilarity(a: LifestyleVector, b: LifestyleVector): number {
  const keys = Object.keys(a) as (keyof LifestyleVector)[];
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const key of keys) {
    dot += a[key] * b[key];
    magA += a[key] ** 2;
    magB += b[key] ** 2;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function lifestyleCompatibility(
  userVector: LifestyleVector,
  countryVector: LifestyleVector,
): number {
  return Math.round(cosineSimilarity(userVector, countryVector) * 100);
}
