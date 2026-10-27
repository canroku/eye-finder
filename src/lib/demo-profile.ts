import type { UserProfile, FaceScanResult } from "@/lib/types";
import { createEmptyProfile } from "@/lib/engines/profile-validation";
import { PERSONALITY_QUESTIONS_DEEP } from "@/lib/data/personality-questions";

const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const MOCK_FACE: FaceScanResult = {
  faceDetected: true,
  confidence: 0.92,
  symmetryScore: 78,
  faceLighting: 72,
  smileScore: 65,
  faceSizeRatio: 0.35,
  expressionPositivity: 70,
  faceScanScore: 74,
  landmarksDetected: 68,
  eyeOpenness: 80,
  facePoseScore: 76,
  jawSymmetry: 73,
  goldenRatioScore: 71,
  skinToneBalance: 69,
  scanQuality: 85,
  dominantExpression: "neutral",
  expressions: {
    happy: 0.2,
    neutral: 0.6,
    sad: 0.05,
    angry: 0.02,
    surprised: 0.05,
    fearful: 0.03,
    disgusted: 0.05,
  },
};

/** Önceden doldurulmuş demo profil — hızlı sonuç önizlemesi */
export function createDemoProfile(): UserProfile {
  const base = createEmptyProfile();
  return {
    ...(base as UserProfile),
    consent: {
      ageConfirmed: true,
      dataProcessingAccepted: true,
      photoAnalysisAccepted: true,
      archetypeDisclaimerAccepted: true,
      acceptedAt: new Date().toISOString(),
    },
    identity: {
      gender: "male",
      interestedIn: "women",
      agePreferenceMin: 22,
      agePreferenceMax: 35,
      bio: "Demo profil",
    },
    demographics: {
      age: 28,
      height: 178,
      weight: 75,
      country: "TR",
      city: "İstanbul",
      education: "bachelor",
      profession: "other",
      incomeBand: "mid",
      languages: ["Türkçe", "English"],
    },
    socialTags: {
      introvert: 35,
      extrovert: 65,
      leader: 55,
      follower: 45,
      social: 70,
      quiet: 30,
      adventurous: 75,
      cautious: 40,
    },
    lifestyle: {
      sport: 70,
      books: 55,
      travel: 80,
      gaming: 40,
      film: 60,
      series: 50,
      nightlife: 50,
      homeLife: 45,
      technology: 65,
      art: 55,
    },
    relationshipIntent: {
      marriage: true,
      longTerm: true,
      shortTerm: false,
      friendship: false,
    },
    appearance: {
      hasBeard: true,
      hairLength: "short",
      clothingStyle: "casual",
      hasTattoo: false,
      smokes: false,
      drinksAlcohol: false,
    },
    personalityAnswers: PERSONALITY_QUESTIONS_DEEP.slice(0, 20).map((q, i) => ({
      questionId: q.id,
      value: 60 + (i % 3) * 15,
    })),
    photos: [
      {
        dataUrl: PIXEL,
        styleTag: "casual",
        contextTag: "solo",
        faceScan: MOCK_FACE,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
