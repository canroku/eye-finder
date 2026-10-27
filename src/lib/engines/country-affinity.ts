import type {
  CountryCompatibility,
  CountryMatrixEntry,
  Demographics,
  LifestyleVector,
  PersonalityProfile,
  RelationshipIntent,
  SocialTags,
  UserProfile,
} from "@/lib/types";
import { COUNTRY_MATRIX } from "@/lib/data/country-matrix";
import { getClusterForCountry } from "@/lib/data/clusters";
import { lifestyleCompatibility } from "@/lib/engines/lifestyle";
import { computePhysicalScore, userTraitVector } from "@/lib/engines/physical";
import { EDUCATION_OPTIONS } from "@/lib/data/form-options";

const AFFINITY_WEIGHTS = {
  physical: 0.25,
  lifestyle: 0.25,
  personality: 0.2,
  relationship: 0.15,
  social: 0.15,
} as const;

function relationshipCompatibility(
  intent: RelationshipIntent,
  country: CountryMatrixEntry,
): number {
  const weights = country.relationshipWeights;
  let score = 0;
  let total = 0;

  if (intent.marriage) {
    score += weights.marriage * 100;
    total += 100;
  }
  if (intent.longTerm) {
    score += weights.longTerm * 100;
    total += 100;
  }
  if (intent.shortTerm) {
    score += weights.shortTerm * 100;
    total += 100;
  }
  if (intent.friendship) {
    score += weights.friendship * 100;
    total += 100;
  }

  if (total === 0) return 50;
  return Math.round(score / total);
}

function personalityCompatibility(
  personality: PersonalityProfile,
  country: CountryMatrixEntry,
): number {
  const cluster = getClusterForCountry(country.code);
  const expected = cluster.socialExpectations;

  const extroDiff = 100 - Math.abs(personality.extraversion - expected.extroversion);

  const calmDiff =
    100 - Math.abs(personality.emotionalStability - (100 - expected.extroversion * 0.3));
  const openDiff = 100 - Math.abs(personality.openness - 70);

  return Math.round((extroDiff * 0.35 + calmDiff * 0.35 + openDiff * 0.3));
}

function socialCompatibility(
  demographics: Demographics,
  socialTags: SocialTags,
  country: CountryMatrixEntry,
): number {
  const cluster = getClusterForCountry(country.code);
  const expected = cluster.socialExpectations;

  const extroScore = socialTags.extrovert;
  const extroDiff = 100 - Math.abs(extroScore - expected.extroversion);

  const eduScore =
    EDUCATION_OPTIONS.find((e) => e.value === demographics.education)?.score ?? 50;
  const eduDiff = 100 - Math.abs(eduScore - expected.education);

  const langDiff =
    100 -
    Math.abs(
      Math.min(demographics.languages.length, 5) * 20 - expected.languages,
    );

  const socialScore = socialTags.social;
  const socialDiff = 100 - Math.abs(socialScore - expected.extroversion);

  return Math.round(extroDiff * 0.3 + eduDiff * 0.25 + langDiff * 0.2 + socialDiff * 0.25);
}

function physicalCompatibility(
  profile: UserProfile,
  country: CountryMatrixEntry,
): number {
  const base = computePhysicalScore(profile.demographics, profile.appearance);
  const traits = userTraitVector(profile.demographics, profile.appearance);
  let boost = 0;
  let boostCount = 0;

  for (const [key, weight] of Object.entries(country.weights)) {
    if (traits[key] !== undefined && weight > 5) {
      boost += Math.min(traits[key], 10) * (weight / 10);
      boostCount++;
    }
  }

  const traitBoost = boostCount > 0 ? boost / boostCount : 0;
  return Math.min(100, Math.round(base * 0.7 + traitBoost * 3));
}

export function computeCountryCompatibility(
  profile: UserProfile,
  lifestyleVector: LifestyleVector,
  personality: PersonalityProfile,
  country: CountryMatrixEntry,
): CountryCompatibility {
  const physical = physicalCompatibility(profile, country);
  const lifestyle = lifestyleCompatibility(lifestyleVector, country.lifestyleWeights);
  const personalityScore = personalityCompatibility(personality, country);
  const relationship = relationshipCompatibility(profile.relationshipIntent, country);
  const social = socialCompatibility(
    profile.demographics,
    profile.socialTags,
    country,
  );

  const affinity = Math.round(
    physical * AFFINITY_WEIGHTS.physical +
      lifestyle * AFFINITY_WEIGHTS.lifestyle +
      personalityScore * AFFINITY_WEIGHTS.personality +
      relationship * AFFINITY_WEIGHTS.relationship +
      social * AFFINITY_WEIGHTS.social,
  );

  return {
    countryCode: country.code,
    countryName: country.name,
    clusterId: country.clusterId,
    affinity,
    physical,
    lifestyle,
    personality: personalityScore,
    relationship,
    social,
  };
}

export function computeAllCountryCompatibilities(
  profile: UserProfile,
  lifestyleVector: LifestyleVector,
  personality: PersonalityProfile,
  matrix: CountryMatrixEntry[] = COUNTRY_MATRIX,
): CountryCompatibility[] {
  return matrix.map((country) =>
    computeCountryCompatibility(profile, lifestyleVector, personality, country),
  ).sort((a, b) => b.affinity - a.affinity);
}

export { AFFINITY_WEIGHTS };
