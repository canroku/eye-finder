import type { EyeScoreResult, UserProfile } from "@/lib/types";
import { analyzeStyleFromProfile } from "@/lib/engines/style-cv";

export interface GlobalProfileType {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  summary: string;
  traits: string[];
}

const TYPES: Omit<GlobalProfileType, "summary" | "traits">[] = [
  {
    id: "social_explorer",
    emoji: "🌍",
    title: "Sosyal Kaşif",
    tagline: "Enerji, merak ve bağlantı",
  },
  {
    id: "calm_intellectual",
    emoji: "🧠",
    title: "Sakin Entelektüel",
    tagline: "Derinlik, denge ve güven",
  },
  {
    id: "active_charmer",
    emoji: "⚡",
    title: "Aktif Çekim",
    tagline: "Sportif duruş ve özgüven",
  },
  {
    id: "warm_connector",
    emoji: "💫",
    title: "Sıcak Bağ Kurucu",
    tagline: "Empati ve samimiyet",
  },
  {
    id: "creative_soul",
    emoji: "🎨",
    title: "Yaratıcı Ruh",
    tagline: "Sanat, seyahat ve özgünlük",
  },
];

export function computeGlobalProfileType(
  profile: UserProfile,
  eyeScore: EyeScoreResult,
): GlobalProfileType {
  const subs = eyeScore.subScores ?? {};
  const social = subs.social ?? 50;
  const personality = subs.personality ?? 50;
  const lifestyle = subs.lifestyle ?? 50;
  const physical = subs.physical ?? 50;
  const photo = subs.photo ?? 50;
  const pp = eyeScore.personalityProfile;
  const style = analyzeStyleFromProfile(profile);

  const scores: Record<string, number> = {
    social_explorer: social * 0.35 + lifestyle * 0.25 + (pp?.openness ?? 50) * 0.2 + (pp?.extraversion ?? 50) * 0.2,
    calm_intellectual:
      (pp?.emotionalStability ?? 50) * 0.3 + (pp?.conscientiousness ?? 50) * 0.25 + personality * 0.25 + lifestyle * 0.1,
    active_charmer: physical * 0.3 + photo * 0.25 + lifestyle * 0.25 + social * 0.2,
    warm_connector:
      (pp?.agreeableness ?? 50) * 0.35 + social * 0.3 + personality * 0.2 + (pp?.extraversion ?? 50) * 0.15,
    creative_soul:
      (pp?.openness ?? 50) * 0.35 + lifestyle * 0.25 + style.confidence * 0.15 + personality * 0.25,
  };

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const base = TYPES.find((t) => t.id === best) ?? TYPES[0];

  const traits: string[] = [];
  if (social >= 65) traits.push("Sosyal ortamlarda öne çıkan profil");
  if (lifestyle >= 65) traits.push("Aktif yaşam tarzı sinyali güçlü");
  if (photo >= 60) traits.push("Görsel çekicilik skoru yüksek");
  if ((pp?.openness ?? 0) >= 65) traits.push("Yeni kültürlere açık");
  if ((pp?.agreeableness ?? 0) >= 65) traits.push("Empatik iletişim");
  if (style.dominantStyle === "formal") traits.push("Şık ve profesyonel stil");
  if (style.dominantStyle === "sport") traits.push("Sportif görsel kimlik");
  if (traits.length < 3) traits.push("Dengeli küresel profil", "Çoklu bölgede uyum potansiyeli");

  const city = profile.demographics?.city ?? "profilin";
  const summary = `${city} merkezli ${base.title.toLowerCase()} profilin, küresel ilgi analizinde ${
    eyeScore.eyeScore ?? "—"
  } Eye Score ile öne çıkıyor. ${base.tagline} — bu tip profiller özellikle seyahat ve kültür odaklı bölgelerde güçlü sinyal verir.`;

  return { ...base, summary, traits: traits.slice(0, 4) };
}
