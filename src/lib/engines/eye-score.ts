import type { SubScores } from "@/lib/types";

const WEIGHTS = {
  physical: 0.2,
  lifestyle: 0.2,
  social: 0.2,
  personality: 0.2,
  photo: 0.2,
} as const;

export function computeEyeScore(subScores: SubScores): number | null {
  const { physical, lifestyle, social, personality, photo } = subScores;
  if (
    physical === null ||
    lifestyle === null ||
    social === null ||
    personality === null ||
    photo === null
  ) {
    return null;
  }

  return Math.round(
    physical * WEIGHTS.physical +
      lifestyle * WEIGHTS.lifestyle +
      social * WEIGHTS.social +
      personality * WEIGHTS.personality +
      photo * WEIGHTS.photo,
  );
}

export { WEIGHTS as EYE_SCORE_WEIGHTS };
