import type { Appearance, Demographics } from "@/lib/types";

function heightScore(height: number): number {
  if (height >= 190) return 95;
  if (height >= 185) return 90;
  if (height >= 180) return 82;
  if (height >= 175) return 72;
  if (height >= 170) return 62;
  if (height >= 165) return 52;
  return 42;
}

function bmiScore(height: number, weight: number): number {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  if (bmi >= 20 && bmi <= 24) return 90;
  if (bmi >= 18.5 && bmi <= 26) return 78;
  if (bmi >= 17 && bmi <= 28) return 65;
  return 50;
}

function appearanceBonus(appearance: Appearance): number {
  let bonus = 50;
  if (appearance.hasBeard) bonus += 5;
  if (appearance.clothingStyle === "formal") bonus += 8;
  if (appearance.clothingStyle === "sport") bonus += 6;
  if (appearance.hairLength === "medium") bonus += 3;
  if (!appearance.smokes) bonus += 5;
  if (appearance.hasTattoo) bonus += 2;
  return Math.min(100, bonus);
}

export function computePhysicalScore(
  demographics: Demographics,
  appearance: Appearance,
): number {
  const hScore = heightScore(demographics.height);
  const bScore = bmiScore(demographics.height, demographics.weight);
  const aScore = appearanceBonus(appearance);

  return Math.round(hScore * 0.4 + bScore * 0.35 + aScore * 0.25);
}

export function userTraitVector(
  demographics: Demographics,
  appearance: Appearance,
): Record<string, number> {
  return {
    tall: heightScore(demographics.height) / 10,
    fitness: 0,
    social_men: 0,
    travel: 0,
    long_relationship: 0,
    education: 0,
    calm_character: 0,
    languages: Math.min(demographics.languages.length, 5),
    beard: appearance.hasBeard ? 8 : 2,
    sport_style: appearance.clothingStyle === "sport" ? 8 : 4,
  };
}
