import type {
  CountryCompatibility,
  CountryMatrixEntry,
  ReasonItem,
  UserProfile,
  LifestyleVector,
  PersonalityProfile,
} from "@/lib/types";
import { TRAIT_LABELS } from "@/lib/data/country-matrix";
import { computePhysicalScore } from "@/lib/engines/physical";
import { EDUCATION_OPTIONS } from "@/lib/data/form-options";

function buildUserTraits(
  profile: UserProfile,
  lifestyleVector: LifestyleVector,
  personality: PersonalityProfile,
): Record<string, number> {
  const eduScore =
    EDUCATION_OPTIONS.find((e) => e.value === profile.demographics.education)?.score ?? 50;

  return {
    tall: profile.demographics.height >= 180 ? 9 : profile.demographics.height >= 175 ? 6 : 3,
    fitness: lifestyleVector.fitness / 10,
    travel: lifestyleVector.travel / 10,
    social_men: profile.socialTags.extrovert / 10,
    long_relationship: profile.relationshipIntent.longTerm ? 9 : 3,
    education: eduScore / 10,
    calm_character: personality.emotionalStability / 10,
    languages: Math.min(profile.demographics.languages.length, 5),
    beard: profile.appearance.hasBeard ? 7 : 2,
    sport_style: profile.appearance.clothingStyle === "sport" ? 8 : 4,
    art: lifestyleVector.art / 10,
    nightlife: lifestyleVector.nightlife / 10,
    technology: lifestyleVector.technology / 10,
  };
}

export function generateReasons(
  profile: UserProfile,
  country: CountryMatrixEntry,
  compatibility: CountryCompatibility,
  lifestyleVector: LifestyleVector,
  personality: PersonalityProfile,
): ReasonItem[] {
  const userTraits = buildUserTraits(profile, lifestyleVector, personality);
  const reasons: ReasonItem[] = [];

  for (const [trait, countryWeight] of Object.entries(country.weights)) {
    if (countryWeight <= 5) continue;
    const userValue = userTraits[trait] ?? 0;
    const contribution = Math.round(userValue * countryWeight * 0.5);
    if (contribution <= 3) continue;

    let category: ReasonItem["category"] = "physical";
    if (["fitness", "travel", "art", "nightlife", "technology"].includes(trait)) {
      category = "lifestyle";
    } else if (["long_relationship"].includes(trait)) {
      category = "relationship";
    } else if (["education", "languages", "social_men", "calm_character"].includes(trait)) {
      category = "social";
    } else if (trait === "calm_character") {
      category = "personality";
    }

    reasons.push({
      trait,
      label: TRAIT_LABELS[trait] ?? trait,
      contribution,
      category,
    });
  }

  const categoryScores = [
    { category: "physical" as const, score: compatibility.physical },
    { category: "lifestyle" as const, score: compatibility.lifestyle },
    { category: "personality" as const, score: compatibility.personality },
    { category: "relationship" as const, score: compatibility.relationship },
    { category: "social" as const, score: compatibility.social },
  ].sort((a, b) => b.score - a.score);

  for (const cat of categoryScores.slice(0, 2)) {
    if (cat.category === "physical" && profile.demographics.height >= 180) {
      reasons.push({
        trait: "tall",
        label: "Uzun boy",
        contribution: Math.round(compatibility.physical * 0.15),
        category: "physical",
      });
    }
    if (cat.category === "lifestyle" && lifestyleVector.travel >= 70) {
      reasons.push({
        trait: "travel",
        label: "Seyahat tutkusu",
        contribution: Math.round(compatibility.lifestyle * 0.12),
        category: "lifestyle",
      });
    }
    if (cat.category === "social" && profile.demographics.education !== "high_school") {
      reasons.push({
        trait: "education",
        label: "Eğitim seviyesi",
        contribution: Math.round(compatibility.social * 0.1),
        category: "social",
      });
    }
  }

  const physicalScore = computePhysicalScore(profile.demographics, profile.appearance);
  void physicalScore;

  const unique = new Map<string, ReasonItem>();
  for (const r of reasons.sort((a, b) => b.contribution - a.contribution)) {
    if (!unique.has(r.trait)) unique.set(r.trait, r);
  }

  return Array.from(unique.values()).slice(0, 5);
}
