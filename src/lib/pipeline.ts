import type { PipelineResult, UserProfile } from "@/lib/types";
import { COUNTRY_MATRIX } from "@/lib/data/country-matrix";
import type { OnboardingMode } from "@/lib/data/personality-questions";
import { getAppsForCountry } from "@/lib/data/country-apps";
import { validateUserProfile } from "@/lib/engines/profile-validation";
import {
  computePersonalityProfile,
  computePersonalityScore,
} from "@/lib/engines/personality";
import { analyzeAllPhotos, computePhotoScore } from "@/lib/engines/photo-analysis";
import { computeSocialValueIndex, computeSocialScore } from "@/lib/engines/social-value";
import {
  buildLifestyleVector,
  computeLifestyleScore,
} from "@/lib/engines/lifestyle";
import { computePhysicalScore } from "@/lib/engines/physical";
import { computeEyeScore } from "@/lib/engines/eye-score";
import { computeAllCountryCompatibilities } from "@/lib/engines/country-affinity";
import { generateReasons } from "@/lib/engines/reason-engine";
import { generateArchetypes } from "@/lib/engines/archetype-generator";
import {
  buildSignalFromPipeline,
  getEffectiveCountryMatrix,
  updateMatrixDeltas,
} from "@/lib/engines/global-learning";
import {
  getMatrixDeltas,
  getSignalCount,
  logInterestSignal,
  saveMatrixDeltas,
} from "@/lib/storage/index";

export interface PipelineOptions {
  maxCountries?: number;
  mode?: OnboardingMode;
}

export async function runPipeline(
  profile: UserProfile,
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const mode = options.mode ?? profile.onboardingMode ?? "standard";
  const maxCountries = options.maxCountries ?? 15;

  const missingSteps = validateUserProfile(profile, mode);
  const signalCount = await getSignalCount();
  const deltas = await getMatrixDeltas();
  const effectiveMatrix = getEffectiveCountryMatrix(COUNTRY_MATRIX, deltas, signalCount);

  const personalityProfile = computePersonalityProfile(profile.personalityAnswers, mode);
  const photoAnalysis = await analyzeAllPhotos(profile.photos);
  const lifestyleVector = buildLifestyleVector(profile.lifestyle, personalityProfile);

  const subScores = {
    physical: computePhysicalScore(profile.demographics, profile.appearance),
    lifestyle: computeLifestyleScore(lifestyleVector),
    social: personalityProfile
      ? computeSocialScore(computeSocialValueIndex(profile.demographics, profile.lifestyle))
      : null,
    personality: computePersonalityScore(personalityProfile),
    photo: computePhotoScore(photoAnalysis),
  };

  const eyeScore = computeEyeScore(subScores);

  const eyeScoreResult = {
    eyeScore,
    subScores,
    socialValueIndex: subScores.social,
    personalityProfile,
    photoAnalysis,
    lifestyleVector,
    missingSteps,
  };

  if (!personalityProfile || missingSteps.length > 0) {
    return {
      eyeScore: eyeScoreResult,
      countries: [],
      computedAt: new Date().toISOString(),
      learningActive: signalCount >= 100,
      signalCount,
    };
  }

  const compatibilities = computeAllCountryCompatibilities(
    profile,
    lifestyleVector,
    personalityProfile,
    effectiveMatrix,
  ).slice(0, Math.min(maxCountries, COUNTRY_MATRIX.length));

  const countries = compatibilities.map((compatibility) => {
    const country = effectiveMatrix.find((c) => c.code === compatibility.countryCode)!;
    return {
      compatibility,
      reasons: generateReasons(
        profile,
        country,
        compatibility,
        lifestyleVector,
        personalityProfile,
      ),
      apps: getAppsForCountry(country.code),
      archetypes: generateArchetypes(profile, country, compatibility.affinity),
    };
  });

  const result: PipelineResult = {
    eyeScore: eyeScoreResult,
    countries,
    computedAt: new Date().toISOString(),
    learningActive: signalCount >= 100,
    signalCount,
  };

  const signal = buildSignalFromPipeline(profile, result);
  void persistLearning(signal, deltas).catch(() => {});

  return result;
}

async function persistLearning(
  signal: ReturnType<typeof buildSignalFromPipeline>,
  deltas: Awaited<ReturnType<typeof getMatrixDeltas>>,
): Promise<void> {
  await logInterestSignal(signal);
  const newDeltas = updateMatrixDeltas(deltas, signal);
  await saveMatrixDeltas(newDeltas);
}
