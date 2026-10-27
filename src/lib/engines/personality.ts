import type { PersonalityAnswer, PersonalityProfile } from "@/lib/types";
import {
  getQuestionsForMode,
  MIN_PERSONALITY_COMPLETION,
  type OnboardingMode,
} from "@/lib/data/personality-questions";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function computePersonalityProfile(
  answers: PersonalityAnswer[],
  mode: OnboardingMode = "standard",
): PersonalityProfile | null {
  const questions = getQuestionsForMode(mode);
  const answeredInSet = answers.filter((a) =>
    questions.some((q) => q.id === a.questionId),
  ).length;
  const completionRate = answeredInSet / questions.length;
  if (completionRate < MIN_PERSONALITY_COMPLETION) return null;

  const answerMap = new Map(answers.map((a) => [a.questionId, a.value]));

  const traits = {
    extraversion: [] as number[],
    openness: [] as number[],
    agreeableness: [] as number[],
    conscientiousness: [] as number[],
    emotional_stability: [] as number[],
  };

  for (const question of questions) {
    const value = answerMap.get(question.id);
    if (value === undefined) continue;
    traits[question.trait].push(value / 100);
  }

  return {
    extraversion: Math.round(average(traits.extraversion) * 100),
    openness: Math.round(average(traits.openness) * 100),
    agreeableness: Math.round(average(traits.agreeableness) * 100),
    conscientiousness: Math.round(average(traits.conscientiousness) * 100),
    emotionalStability: Math.round(average(traits.emotional_stability) * 100),
    completionRate: Math.round(completionRate * 100),
  };
}

export function computePersonalityScore(
  profile: PersonalityProfile | null,
): number | null {
  if (!profile) return null;
  return Math.round(
    (profile.extraversion +
      profile.openness +
      profile.agreeableness +
      profile.conscientiousness +
      profile.emotionalStability) /
      5,
  );
}
