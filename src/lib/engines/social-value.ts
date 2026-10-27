import type { Demographics, LifestyleSelfReport } from "@/lib/types";
import { EDUCATION_OPTIONS, PROFESSION_PRESTIGE } from "@/lib/data/form-options";

export function computeSocialValueIndex(
  demographics: Demographics,
  lifestyle: LifestyleSelfReport,
): number {
  const educationScore =
    EDUCATION_OPTIONS.find((e) => e.value === demographics.education)?.score ?? 50;

  const careerScore = PROFESSION_PRESTIGE[demographics.profession] ?? 55;

  const languageCount = Math.min(demographics.languages.length, 5);
  const languageScore = (languageCount / 5) * 100;

  const activityScore = (lifestyle.sport + lifestyle.travel) / 2;

  const hobbyValues = [
    lifestyle.books,
    lifestyle.art,
    lifestyle.technology,
    lifestyle.film,
    lifestyle.series,
  ];
  const hobbyDepth =
    hobbyValues.filter((h) => h >= 60).length / hobbyValues.length;

  const hobbyScore = hobbyDepth * 100;

  const svi = Math.round(
    educationScore * 0.25 +
      careerScore * 0.2 +
      languageScore * 0.15 +
      activityScore * 0.2 +
      hobbyScore * 0.2,
  );

  return Math.min(100, Math.max(0, svi));
}

export function computeSocialScore(svi: number): number {
  return svi;
}
