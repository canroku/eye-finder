import { describe, expect, it } from "vitest";
import { computeEyeScore, EYE_SCORE_WEIGHTS } from "@/lib/engines/eye-score";
import { computePersonalityProfile } from "@/lib/engines/personality";
import { PERSONALITY_QUESTIONS, PERSONALITY_QUESTIONS_QUICK } from "@/lib/data/personality-questions";
import {
  getEffectiveCountryMatrix,
  updateMatrixDeltas,
  LEARNING_THRESHOLD,
} from "@/lib/engines/global-learning";
import { COUNTRY_MATRIX } from "@/lib/data/country-matrix";
import { normalizeCountryResult } from "@/lib/normalize-result";
import { validateUserProfile } from "@/lib/engines/profile-validation";
import { computePhotoAnalysisDepth } from "@/lib/engines/face-scan";
import { computeGlobalProfileType } from "@/lib/engines/profile-type";
import { createEmptyProfile } from "@/lib/engines/profile-validation";
import { stripPhotosForStorage } from "@/lib/utils/profile-storage";
import type { UserProfile } from "@/lib/types";

describe("computeEyeScore", () => {
  it("returns null when any sub-score is missing", () => {
    expect(
      computeEyeScore({
        physical: 80,
        lifestyle: null,
        social: 70,
        personality: 75,
        photo: 82,
      }),
    ).toBeNull();
  });

  it("computes weighted average correctly", () => {
    const subs = { physical: 80, lifestyle: 70, social: 90, personality: 60, photo: 100 };
    const expected = Math.round(
      subs.physical * EYE_SCORE_WEIGHTS.physical +
        subs.lifestyle * EYE_SCORE_WEIGHTS.lifestyle +
        subs.social * EYE_SCORE_WEIGHTS.social +
        subs.personality * EYE_SCORE_WEIGHTS.personality +
        subs.photo * EYE_SCORE_WEIGHTS.photo,
    );
    expect(computeEyeScore(subs)).toBe(expected);
  });
});

describe("computePersonalityProfile", () => {
  it("requires full completion", () => {
    const partial = PERSONALITY_QUESTIONS.slice(0, 5).map((q) => ({
      questionId: q.id,
      value: 80,
    }));
    expect(computePersonalityProfile(partial)).toBeNull();
  });

  it("returns scores 0-100 for full standard answers", () => {
    const answers = PERSONALITY_QUESTIONS.map((q) => ({
      questionId: q.id,
      value: 80,
    }));
    const profile = computePersonalityProfile(answers, "standard");
    expect(profile).not.toBeNull();
    expect(profile!.extraversion).toBe(80);
    expect(profile!.completionRate).toBe(100);
  });

  it("accepts quick mode with 16 answers", () => {
    const answers = PERSONALITY_QUESTIONS_QUICK.map((q) => ({
      questionId: q.id,
      value: 70,
    }));
    const profile = computePersonalityProfile(answers, "quick");
    expect(profile).not.toBeNull();
    expect(profile!.completionRate).toBe(100);
  });
});

describe("global learning", () => {
  it("does not adjust matrix below threshold", () => {
    const base = COUNTRY_MATRIX[0];
    const adjusted = getEffectiveCountryMatrix(COUNTRY_MATRIX, { TR: { tall: 2 } }, LEARNING_THRESHOLD - 1);
    expect(adjusted[0].weights.tall).toBe(base.weights.tall);
  });

  it("applies deltas above threshold", () => {
    const deltas = updateMatrixDeltas({}, {
      region: "TR",
      likedTraits: ["tall", "fitness"],
      timestamp: new Date().toISOString(),
      topCountry: "TR",
    });
    const tr = COUNTRY_MATRIX.find((c) => c.code === "TR")!;
    const effective = getEffectiveCountryMatrix(COUNTRY_MATRIX, deltas, LEARNING_THRESHOLD);
    const effectiveTr = effective.find((c) => c.code === "TR")!;
    expect(effectiveTr.weights.tall).toBeGreaterThan(tr.weights.tall);
  });
});

describe("normalizeCountryResult", () => {
  it("does not crash when profile lacks identity", () => {
    const partial = {
      compatibility: {
        countryCode: "TR",
        countryName: "Türkiye",
        affinity: 78,
        clusterId: "mediterranean",
        clusterName: "Akdeniz",
        physical: 70,
        lifestyle: 70,
        personality: 70,
        relationship: 70,
        social: 70,
      },
    };
    const withoutIdentity = normalizeCountryResult(partial, {} as UserProfile);
    expect(withoutIdentity.archetypes).toEqual([]);
    expect(withoutIdentity.apps.length).toBeGreaterThan(0);
  });
});

describe("validateUserProfile", () => {
  it("requires only 1 photo with face", () => {
    const base = {
      consent: {
        ageConfirmed: true,
        dataProcessingAccepted: true,
        photoAnalysisAccepted: true,
        archetypeDisclaimerAccepted: true,
        acceptedAt: "",
      },
      identity: { gender: "male" as const, interestedIn: "women" as const, agePreferenceMin: 22, agePreferenceMax: 35, bio: "" },
      demographics: { age: 25, height: 180, weight: 75, country: "TR", city: "Istanbul", education: "bachelor" as const, profession: "developer", incomeBand: "mid" as const, languages: ["Türkçe"] },
      relationshipIntent: { marriage: false, longTerm: true, shortTerm: false, friendship: false },
      socialTags: { introvert: 30, extrovert: 70, leader: 50, follower: 50, social: 60, quiet: 40, adventurous: 50, cautious: 50 },
      lifestyle: { sport: 50, books: 50, travel: 50, gaming: 50, film: 50, series: 50, art: 50, nightlife: 50, technology: 50, homeLife: 50 },
      appearance: { hairLength: "short" as const, clothingStyle: "casual" as const, wearsGlasses: false, hasBeard: false, hasTattoo: false, smokes: false, drinksAlcohol: false },
      personalityAnswers: [],
      photos: [{ dataUrl: "x", styleTag: "casual" as const, contextTag: "solo" as const, faceScan: { faceDetected: true, confidence: 90, symmetryScore: 80, faceLighting: 80, smileScore: 70, faceSizeRatio: 60, expressionPositivity: 70, faceScanScore: 82, landmarksDetected: 68, eyeOpenness: 75, facePoseScore: 80, jawSymmetry: 78, goldenRatioScore: 70, skinToneBalance: 85, scanQuality: 88, dominantExpression: "neutral", expressions: { happy: 20, neutral: 60, sad: 5, angry: 5, surprised: 5, fearful: 3, disgusted: 2 } } }],
      createdAt: "",
    };
    const missing = validateUserProfile(base);
    expect(missing.some((m) => m.includes("fotoğraf"))).toBe(false);
    expect(missing.some((m) => m.includes("Kişilik"))).toBe(true);
  });
});

describe("stripPhotosForStorage", () => {
  it("removes dataUrl but keeps faceScan", () => {
    const profile = {
      photos: [{ dataUrl: "data:image/jpeg;base64,abc", styleTag: "casual" as const, contextTag: "solo" as const, faceScan: { faceDetected: true, confidence: 90, symmetryScore: 80, faceLighting: 80, smileScore: 70, faceSizeRatio: 60, expressionPositivity: 70, faceScanScore: 82, landmarksDetected: 68, eyeOpenness: 75, facePoseScore: 80, jawSymmetry: 78, goldenRatioScore: 70, skinToneBalance: 85, scanQuality: 88, dominantExpression: "neutral", expressions: { happy: 20, neutral: 60, sad: 5, angry: 5, surprised: 5, fearful: 3, disgusted: 2 } } }],
    } as UserProfile;
    const stripped = stripPhotosForStorage(profile);
    expect(stripped.photos[0].dataUrl).toBe("");
    expect(stripped.photos[0].faceScan?.faceScanScore).toBe(82);
  });
});

describe("computePhotoAnalysisDepth", () => {
  it("increases with more photos", () => {
    expect(computePhotoAnalysisDepth(1, 1)).toBeLessThan(computePhotoAnalysisDepth(5, 5));
  });
});

describe("computeGlobalProfileType", () => {
  it("returns a profile type with title and traits", () => {
    const profile = createEmptyProfile() as UserProfile;
    const eyeScore = {
      eyeScore: 72,
      socialValueIndex: null,
      subScores: { physical: 70, lifestyle: 80, social: 75, personality: 68, photo: 65 },
      personalityProfile: null,
      photoAnalysis: null,
      lifestyleVector: null,
      missingSteps: [],
    };
    const type = computeGlobalProfileType(profile, eyeScore);
    expect(type.title).toBeTruthy();
    expect(type.traits.length).toBeGreaterThan(0);
  });
});
