import type { SocialTags, UserProfile } from "@/lib/types";
import { MIN_PHOTOS } from "@/lib/data/form-options";
import {
  getQuestionsForMode,
  type OnboardingMode,
} from "@/lib/data/personality-questions";

const MIN_FACE_PHOTOS = 1;

export function validateUserProfile(
  profile: Partial<UserProfile>,
  mode: OnboardingMode = "standard",
): string[] {
  const missing: string[] = [];

  if (!profile.consent?.ageConfirmed) missing.push("18+ yaş onayı");
  if (!profile.consent?.dataProcessingAccepted) missing.push("Veri işleme onayı");
  if (!profile.consent?.photoAnalysisAccepted) missing.push("Fotoğraf analizi onayı");
  if (!profile.identity?.gender) missing.push("Cinsiyet bilgisi");
  if (!profile.identity?.interestedIn) missing.push("İlgilendiğin cinsiyet");
  if (!profile.demographics?.age) missing.push("Demografik bilgiler");
  if (!profile.relationshipIntent) missing.push("İlişki tercihleri");
  if (!profile.socialTags) missing.push("Sosyal etiketler");
  if (!profile.lifestyle) missing.push("Yaşam tarzı");
  if (!profile.appearance) missing.push("Dış görünüş");

  const answered = profile.personalityAnswers?.length ?? 0;
  const minAnswers = getQuestionsForMode(mode).length;
  if (answered < minAnswers) {
    missing.push(`Kişilik testi (min ${minAnswers} soru)`);
  }

  if ((profile.photos?.length ?? 0) < MIN_PHOTOS) {
    missing.push(`En az ${MIN_PHOTOS} fotoğraf`);
  }

  const faceCount =
    profile.photos?.filter((p) => p.faceScan?.faceDetected).length ?? 0;
  if ((profile.photos?.length ?? 0) >= MIN_PHOTOS && faceCount < MIN_FACE_PHOTOS) {
    missing.push(`En az ${MIN_FACE_PHOTOS} fotoğrafta yüz tespiti`);
  }

  return missing;
}

export function createEmptyProfile(): Partial<UserProfile> {
  return {
    consent: {
      ageConfirmed: false,
      dataProcessingAccepted: false,
      photoAnalysisAccepted: false,
      archetypeDisclaimerAccepted: false,
      acceptedAt: "",
    },
    identity: {
      gender: "male",
      interestedIn: "women",
      agePreferenceMin: 22,
      agePreferenceMax: 35,
      bio: "",
    },
    demographics: {
      age: 25,
      height: 175,
      weight: 75,
      country: "TR",
      city: "",
      education: "bachelor",
      profession: "other",
      incomeBand: "mid",
      languages: ["Türkçe"],
    },
    relationshipIntent: {
      marriage: false,
      longTerm: true,
      shortTerm: false,
      friendship: false,
    },
    socialTags: {
      introvert: 50,
      extrovert: 50,
      leader: 50,
      follower: 50,
      social: 50,
      quiet: 50,
      adventurous: 50,
      cautious: 50,
    },
    lifestyle: {
      sport: 50,
      books: 50,
      travel: 50,
      gaming: 50,
      film: 50,
      series: 50,
      nightlife: 50,
      homeLife: 50,
      technology: 50,
      art: 50,
    },
    appearance: {
      hasBeard: false,
      hairLength: "short",
      clothingStyle: "casual",
      hasTattoo: false,
      smokes: false,
      drinksAlcohol: false,
    },
    photos: [],
    personalityAnswers: [],
    createdAt: new Date().toISOString(),
  };
}

export { MIN_FACE_PHOTOS };

export type SocialPresetId = "social_butterfly" | "thinker" | "leader" | "calm";

export const SOCIAL_PRESETS: Record<
  SocialPresetId,
  { label: string; emoji: string; desc: string; tags: SocialTags }
> = {
  social_butterfly: {
    label: "Sosyal Kelebek",
    emoji: "🦋",
    desc: "Dışa dönük, enerjik, insanlarla bir arada",
    tags: {
      introvert: 20,
      extrovert: 90,
      leader: 55,
      follower: 40,
      social: 90,
      quiet: 15,
      adventurous: 70,
      cautious: 35,
    },
  },
  thinker: {
    label: "Düşünür",
    emoji: "🧠",
    desc: "İçe dönük, sakin, derin sohbet",
    tags: {
      introvert: 85,
      extrovert: 25,
      leader: 35,
      follower: 55,
      social: 30,
      quiet: 80,
      adventurous: 40,
      cautious: 65,
    },
  },
  leader: {
    label: "Lider",
    emoji: "👑",
    desc: "Girişken, maceracı, yönlendirici",
    tags: {
      introvert: 30,
      extrovert: 75,
      leader: 90,
      follower: 20,
      social: 70,
      quiet: 25,
      adventurous: 85,
      cautious: 30,
    },
  },
  calm: {
    label: "Sakin & Garantici",
    emoji: "🌿",
    desc: "Dengeli, güvenilir, öngörülebilir",
    tags: {
      introvert: 55,
      extrovert: 45,
      leader: 40,
      follower: 65,
      social: 50,
      quiet: 60,
      adventurous: 35,
      cautious: 85,
    },
  },
};

export type LifestylePresetId = "active" | "culture" | "homebody" | "nightlife";

export const LIFESTYLE_PRESETS: Record<
  LifestylePresetId,
  { label: string; emoji: string; desc: string; values: UserProfile["lifestyle"] }
> = {
  active: {
    label: "Aktif & Spor",
    emoji: "🏃",
    desc: "Spor, seyahat, macera",
    values: {
      sport: 90,
      books: 40,
      travel: 85,
      gaming: 30,
      film: 50,
      series: 40,
      nightlife: 45,
      homeLife: 30,
      technology: 55,
      art: 35,
    },
  },
  culture: {
    label: "Kültür & Sanat",
    emoji: "🎭",
    desc: "Kitap, sanat, film",
    values: {
      sport: 35,
      books: 85,
      travel: 65,
      gaming: 25,
      film: 80,
      series: 75,
      nightlife: 40,
      homeLife: 60,
      technology: 45,
      art: 90,
    },
  },
  homebody: {
    label: "Ev & Teknoloji",
    emoji: "🏠",
    desc: "Ev yaşamı, dizi, oyun",
    values: {
      sport: 30,
      books: 55,
      travel: 35,
      gaming: 75,
      film: 70,
      series: 85,
      nightlife: 20,
      homeLife: 90,
      technology: 80,
      art: 40,
    },
  },
  nightlife: {
    label: "Sosyal & Gece",
    emoji: "🌃",
    desc: "Gece hayatı, sosyal etkinlik",
    values: {
      sport: 50,
      books: 35,
      travel: 60,
      gaming: 40,
      film: 55,
      series: 45,
      nightlife: 90,
      homeLife: 35,
      technology: 50,
      art: 55,
    },
  },
};
