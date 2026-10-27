import type { CountryMatrixEntry, PipelineResult, UserProfile } from "@/lib/types";
import { COUNTRY_MATRIX } from "@/lib/data/country-matrix";
import type { GlobalInterestSignal, MatrixDeltas } from "@/lib/storage/index";

const LEARNING_RATE = 0.02;
const MAX_DELTA = 3;
export const LEARNING_THRESHOLD = 100;

export function buildSignalFromPipeline(
  profile: UserProfile,
  result: PipelineResult,
): GlobalInterestSignal {
  const top = result.countries[0];
  const traits: string[] = [];

  if (profile.demographics.height >= 180) traits.push("tall");
  if (profile.lifestyle.sport >= 60) traits.push("fitness");
  if (profile.lifestyle.travel >= 60) traits.push("travel");
  if (profile.relationshipIntent.longTerm) traits.push("long_relationship");
  if (profile.demographics.education !== "high_school") traits.push("education");
  if (profile.socialTags.extrovert >= 60) traits.push("social_men");

  return {
    region: profile.demographics.country,
    likedTraits: traits,
    timestamp: new Date().toISOString(),
    topCountry: top?.compatibility.countryCode,
  };
}

export function updateMatrixDeltas(
  deltas: MatrixDeltas,
  signal: GlobalInterestSignal,
): MatrixDeltas {
  const country = signal.topCountry ?? signal.region;
  if (!country) return deltas;

  const next = { ...deltas };
  if (!next[country]) next[country] = {};

  for (const trait of signal.likedTraits) {
    const current = next[country][trait] ?? 0;
    next[country][trait] = Math.min(MAX_DELTA, current + LEARNING_RATE * 10);
  }

  return next;
}

export function getEffectiveCountryMatrix(
  base: CountryMatrixEntry[],
  deltas: MatrixDeltas,
  signalCount: number,
): CountryMatrixEntry[] {
  if (signalCount < LEARNING_THRESHOLD) return base;

  return base.map((country) => {
    const delta = deltas[country.code];
    if (!delta) return country;

    const weights = { ...country.weights };
    for (const [trait, adjustment] of Object.entries(delta)) {
      if (weights[trait] !== undefined) {
        weights[trait] = Math.min(15, weights[trait] + adjustment);
      }
    }
    return { ...country, weights };
  });
}

export function getLearningStatus(signalCount: number): {
  active: boolean;
  progress: number;
  label: string;
} {
  const progress = Math.min(100, Math.round((signalCount / LEARNING_THRESHOLD) * 100));
  const active = signalCount >= LEARNING_THRESHOLD;
  return {
    active,
    progress,
    label: active
      ? "Dinamik öğrenme aktif — matrisler sinyallerle güncelleniyor"
      : `Dinamik öğrenme: ${signalCount}/${LEARNING_THRESHOLD} sinyal (${progress}%)`,
  };
}
