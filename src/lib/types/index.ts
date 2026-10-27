export type EducationLevel =
  | "high_school"
  | "associate"
  | "bachelor"
  | "master"
  | "doctorate";

export type IncomeBand =
  | "low"
  | "lower_mid"
  | "mid"
  | "upper_mid"
  | "high";

export type Gender = "male" | "female" | "non_binary" | "other";
export type InterestedIn = "men" | "women" | "both" | "all";

export type HairLength = "short" | "medium" | "long" | "bald";
export type ClothingStyle = "formal" | "casual" | "sport" | "street";
export type PhotoStyleTag = "formal" | "casual" | "sport" | "street";
export type PhotoContextTag = "solo" | "friends" | "travel" | "sport";

export type BigFiveTrait =
  | "extraversion"
  | "openness"
  | "agreeableness"
  | "conscientiousness"
  | "emotional_stability";

export interface UserConsent {
  ageConfirmed: boolean;
  dataProcessingAccepted: boolean;
  photoAnalysisAccepted: boolean;
  archetypeDisclaimerAccepted: boolean;
  acceptedAt: string;
}

export interface UserIdentity {
  gender: Gender;
  interestedIn: InterestedIn;
  agePreferenceMin: number;
  agePreferenceMax: number;
  bio: string;
}

export interface Demographics {
  age: number;
  height: number;
  weight: number;
  country: string;
  city: string;
  education: EducationLevel;
  profession: string;
  incomeBand: IncomeBand;
  languages: string[];
}

export interface RelationshipIntent {
  marriage: boolean;
  longTerm: boolean;
  shortTerm: boolean;
  friendship: boolean;
}

export interface SocialTags {
  introvert: number;
  extrovert: number;
  leader: number;
  follower: number;
  social: number;
  quiet: number;
  adventurous: number;
  cautious: number;
}

export interface LifestyleSelfReport {
  sport: number;
  books: number;
  travel: number;
  gaming: number;
  film: number;
  series: number;
  nightlife: number;
  homeLife: number;
  technology: number;
  art: number;
}

export interface Appearance {
  hasBeard: boolean;
  hairLength: HairLength;
  clothingStyle: ClothingStyle;
  hasTattoo: boolean;
  smokes: boolean;
  drinksAlcohol: boolean;
}

export interface PersonalityAnswer {
  questionId: string;
  value: number;
}

export interface PhotoUpload {
  dataUrl: string;
  styleTag: PhotoStyleTag;
  contextTag: PhotoContextTag;
  faceScan?: FaceScanResult;
}

export interface FaceScanResult {
  faceDetected: boolean;
  confidence: number;
  symmetryScore: number;
  faceLighting: number;
  smileScore: number;
  faceSizeRatio: number;
  expressionPositivity: number;
  faceScanScore: number;
  landmarksDetected: number;
  eyeOpenness: number;
  facePoseScore: number;
  jawSymmetry: number;
  goldenRatioScore: number;
  skinToneBalance: number;
  scanQuality: number;
  dominantExpression: string;
  expressions: {
    happy: number;
    neutral: number;
    sad: number;
    angry: number;
    surprised: number;
    fearful: number;
    disgusted: number;
  };
}

export interface UserProfile {
  consent: UserConsent;
  identity: UserIdentity;
  demographics: Demographics;
  relationshipIntent: RelationshipIntent;
  socialTags: SocialTags;
  lifestyle: LifestyleSelfReport;
  appearance: Appearance;
  photos: PhotoUpload[];
  personalityAnswers: PersonalityAnswer[];
  onboardingMode?: "quick" | "standard" | "deep";
  createdAt: string;
}

export interface PersonalityProfile {
  extraversion: number;
  openness: number;
  agreeableness: number;
  conscientiousness: number;
  emotionalStability: number;
  completionRate: number;
}

export interface PhotoAnalysis {
  lightScore: number;
  sharpnessScore: number;
  compositionScore: number;
  contrastScore: number;
  styleTags: PhotoStyleTag[];
  contextTags: PhotoContextTag[];
  photoProfileScore: number;
  faceScanScore: number;
  photosWithFace: number;
  averageSymmetry: number;
  averageSmile: number;
  averageEyeOpenness: number;
  averagePoseScore: number;
  consistencyScore: number;
  totalPhotos: number;
  analysisDepth: number;
  photoCountBonus: number;
  perPhotoFace: FaceScanResult[];
}

export interface LifestyleVector {
  fitness: number;
  travel: number;
  gaming: number;
  books: number;
  nightlife: number;
  art: number;
  film: number;
  technology: number;
  homeLife: number;
}

export interface SubScores {
  physical: number | null;
  lifestyle: number | null;
  social: number | null;
  personality: number | null;
  photo: number | null;
}

export interface EyeScoreResult {
  eyeScore: number | null;
  subScores: SubScores;
  socialValueIndex: number | null;
  personalityProfile: PersonalityProfile | null;
  photoAnalysis: PhotoAnalysis | null;
  lifestyleVector: LifestyleVector | null;
  missingSteps: string[];
}

export interface CountryCompatibility {
  countryCode: string;
  countryName: string;
  clusterId: string;
  affinity: number;
  physical: number;
  lifestyle: number;
  personality: number;
  relationship: number;
  social: number;
}

export interface ReasonItem {
  trait: string;
  label: string;
  contribution: number;
  category: "physical" | "lifestyle" | "personality" | "relationship" | "social";
}

export interface DatingAppInfo {
  name: string;
  type: "global" | "local";
  popularity: number;
  /** Ülkedeki göreli kullanıcı aktivitesi (2025 pazar verisi — Similarweb/Statista) */
  activityLevel: "top" | "high" | "medium" | "niche";
  description: string;
  url?: string;
}

export interface ProfileArchetype {
  id: string;
  label: string;
  gender: Gender;
  ageRange: string;
  matchScore: number;
  externalBeauty: {
    summary: string;
    traits: string[];
  };
  internalBeauty: {
    summary: string;
    traits: string[];
  };
}

export interface CountryResult {
  compatibility: CountryCompatibility;
  reasons: ReasonItem[];
  apps: DatingAppInfo[];
  archetypes: ProfileArchetype[];
}

export interface PipelineResult {
  eyeScore: EyeScoreResult;
  countries: CountryResult[];
  computedAt: string;
  learningActive: boolean;
  signalCount: number;
}

export interface PersonalityQuestion {
  id: string;
  text: string;
  trait: BigFiveTrait;
  leftLabel: string;
  rightLabel: string;
}

export interface ClusterProfile {
  id: string;
  name: string;
  countries: string[];
  relationshipWeights: {
    marriage: number;
    longTerm: number;
    shortTerm: number;
    friendship: number;
  };
  lifestyleWeights: LifestyleVector;
  socialExpectations: {
    extroversion: number;
    education: number;
    languages: number;
    fitness: number;
  };
}

export interface CountryMatrixEntry {
  code: string;
  name: string;
  clusterId: string;
  flag: string;
  weights: Record<string, number>;
  lifestyleWeights: LifestyleVector;
  relationshipWeights: {
    marriage: number;
    longTerm: number;
    shortTerm: number;
    friendship: number;
  };
}
