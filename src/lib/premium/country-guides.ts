import type { UserProfile } from "@/lib/types";
import { getCountryIntel } from "@/lib/data/country-intelligence";
import { ACTIVITY_LABELS, getAppsForCountry, getTopAppForCountry } from "@/lib/data/country-apps";

export interface CountryGuideLite {
  countryName: string;
  countryCode: string;
  tips: string[];
  communication: string;
  meeting: string;
  cultureSnapshot: string;
  firstDateIdeas: string[];
  practicalTips: string[];
  meetingPlaces: string[];
}

export interface SocialActionPlan {
  countryName: string;
  countryCode: string;
  headline: string;
  channels: { title: string; detail: string }[];
  messageTemplates: string[];
  profileTips: string[];
  greenFlags: string[];
  redFlags: string[];
  weeklyPlan: { day: string; action: string }[];
  alternatives: string[];
}

export interface CountryReachGuide {
  countryCode: string;
  countryName: string;
  affinity: number | null;
  headline: string;
  appVsRealLife: string;
  datingPace: string;
  datingDirectness: number;
  apps: {
    name: string;
    type: "global" | "local";
    activityLevel: string;
    activityLabel: string;
    popularity: number;
    description: string;
    url?: string;
  }[];
  offlineHotspots: { place: string; detail: string }[];
  onlineSteps: string[];
  offlineSteps: string[];
  messageTemplates: string[];
  conversationStarters: string[];
  bestSeason: string;
  safetyNote: string;
}

export function buildCountryGuideLite(
  countryCode: string,
  countryName: string,
  profile: UserProfile | null,
): CountryGuideLite {
  const intel = getCountryIntel(countryCode, countryName);
  const social = profile?.socialTags
    ? profile.socialTags.extrovert > profile.socialTags.introvert
      ? "dışa dönük sosyal profil"
      : "içe dönük sosyal profil"
    : "sosyal profilin";

  return {
    countryName,
    countryCode,
    tips: [
      intel.greetingStyle,
      `${countryName}'de ${social} ile uyumlu ortamları tercih et.`,
      intel.socialNorms[0] ?? "İlk mesajda kültürel nezaket + ortak ilgi dengesini koru.",
      intel.localCustoms[0] ?? intel.appVsRealLife,
    ],
    communication: `${countryName}'de doğrudanlık ${intel.datingDirectness}/10 — ${intel.datingPace} tempo beklenir. ${intel.taboos[0] ?? "Saygılı iletişim önemli."}`,
    meeting: `${intel.meetingPlaces.slice(0, 2).join(", ")} gibi mekanlar güvenli başlangıç. En iyi sezon: ${intel.bestSeason}.`,
    cultureSnapshot: `${intel.clusterName} · ${intel.languages.join("/")} · Buluşma ~${intel.avgDateCost}`,
    firstDateIdeas: intel.firstDateIdeas,
    practicalTips: [
      `İngilizce seviyesi: ${intel.englishLevel}/10`,
      intel.safetyNote,
      ...intel.profileTips.slice(0, 2),
    ],
    meetingPlaces: intel.meetingPlaces,
  };
}

export function buildSocialActionPlan(
  countryCode: string,
  countryName: string,
  profile: UserProfile | null,
  score: number,
): SocialActionPlan {
  const guide = buildCountryGuideLite(countryCode, countryName, profile);
  const intel = getCountryIntel(countryCode, countryName);
  const topApp = getTopAppForCountry(countryCode);
  const localApps = getAppsForCountry(countryCode).filter((a) => a.type === "local");
  const intent = profile?.identity?.interestedIn ?? "everyone";
  const city = profile?.demographics?.city ?? "şehrin";

  return {
    countryName,
    countryCode,
    headline: `${countryName}'de %${score} uyum skorunla nasıl tanışırsın`,
    channels: [
      {
        title: topApp ? `${topApp.name} optimizasyonu` : "Yerel sosyal uygulamalar",
        detail: topApp
          ? `${countryName}'de ${topApp.activityLevel} aktivite — ${topApp.description}`
          : `${countryName} için popüler dating/sosyal app'leri profil tipine göre optimize et.`,
      },
      {
        title: "Expat & dil buluşmaları",
        detail: `${city} ve ${intel.meetingPlaces[0] ?? "meetup"} etkinliklerine katıl.`,
      },
      {
        title: "Hobi tabanlı gruplar",
        detail: intel.meetingPlaces.slice(1, 3).join(" · ") || "Spor, sanat veya network etkinlikleri.",
      },
      {
        title: "Online → offline köprü",
        detail: `Tempo: ${intel.datingPace}. 3 mesaj kuralı: tanış → ortak konu → ${intel.firstDateIdeas[0] ?? "kısa buluşma"}.`,
      },
    ],
    messageTemplates: [
      `Merhaba! ${countryName} kültürüne ilgim var, sen de [ortak ilgi] yapıyor musun?`,
      "Profilinde [detay] dikkatimi çekti — hafta sonu kısa bir kahve/sohbet nasıl olur?",
      intent === "men"
        ? "Şehirde yeni keşfettiğim bir mekan var, birlikte denemek ister misin?"
        : "Yeni bir etkinlik buldum, birlikte gitmek ister misin?",
    ],
    profileTips: intel.profileTips,
    greenFlags: [
      "Karşılıklı soru soran, plan yapan profiller",
      "Video/voice öncesi uzun sohbet kurabilen kişiler",
      "Kültürel farklılıklara saygılı iletişim",
    ],
    redFlags: [
      "Hemen para/kişisel bilgi isteyenler",
      "Sürekli platform dışına çekmeye çalışan hesaplar",
      "Tutarsız fotoğraf ve profil bilgisi",
    ],
    weeklyPlan: [
      { day: "Pzt", action: "Profil fotoğrafı + bio optimizasyonu" },
      { day: "Sal", action: "2 hedef ülke app'inde 5 kaliteli eşleşme" },
      { day: "Çar", action: "1 expat/dil etkinliği araştır" },
      { day: "Per", action: "3 kişiye kişiselleştirilmiş mesaj" },
      { day: "Cum", action: "Online sohbet → kısa buluşma teklifi" },
      { day: "Cmt", action: "Sosyal ortam / grup etkinliği" },
      { day: "Paz", action: "Haftayı değerlendir, alternatif ülke not et" },
    ],
    alternatives: [
      ...guide.tips,
      ...(localApps[0] ? [`Alternatif kanal: ${localApps[0].name}`] : []),
      intel.bestSeason,
    ],
  };
}

export function buildCountryReachGuide(
  countryCode: string,
  countryName: string,
  profile: UserProfile | null,
  affinity: number | null,
): CountryReachGuide {
  const intel = getCountryIntel(countryCode, countryName);
  const apps = getAppsForCountry(countryCode);
  const topApp = getTopAppForCountry(countryCode);
  const city = profile?.demographics?.city ?? "şehrin";

  const onlineSteps = [
    topApp
      ? `${topApp.name} profilini ${countryName} kitlesine göre optimize et — ${topApp.description}`
      : `${countryName} için popüler uygulamalarda profil oluştur.`,
    `Tempo: ${intel.datingPace}. İlk 3 mesajda ortak ilgi + kısa buluşma teklifi.`,
    intel.profileTips[0] ?? "Net yüz fotoğrafı + ilgi alanı belirten bio kullan.",
    `Doğrudanlık seviyesi ${intel.datingDirectness}/10 — mesaj tonunu buna göre ayarla.`,
  ];

  const offlineSteps = [
    `${intel.meetingPlaces[0] ?? "Meetup etkinlikleri"} — ${city} veya hedef şehirde aktif gruplara katıl.`,
    intel.meetingPlaces[1]
      ? `${intel.meetingPlaces[1]} gibi mekanlarda sosyal ortam ara.`
      : "Dil değişim buluşmaları ve hobi grupları güvenli başlangıç.",
    intel.localCustoms[0] ?? "Grup etkinlikleri birebir tanışmadan daha rahat olabilir.",
    `En iyi sezon: ${intel.bestSeason}. ${intel.safetyNote}`,
  ];

  return {
    countryCode,
    countryName,
    affinity,
    headline:
      affinity != null
        ? `${countryName}'de %${affinity} uyum — buradaki insanlara nasıl ulaşırsın`
        : `${countryName}'de insanlara nasıl ulaşırsın`,
    appVsRealLife: intel.appVsRealLife,
    datingPace: intel.datingPace,
    datingDirectness: intel.datingDirectness,
    apps: apps.slice(0, 6).map((a) => ({
      name: a.name,
      type: a.type,
      activityLevel: a.activityLevel,
      activityLabel: ACTIVITY_LABELS[a.activityLevel],
      popularity: a.popularity,
      description: a.description,
      url: a.url,
    })),
    offlineHotspots: intel.meetingPlaces.slice(0, 5).map((place, i) => ({
      place,
      detail:
        i === 0
          ? "Yüksek sosyal yoğunluk — yeni tanışmalar için uygun"
          : intel.conversationStarters[i - 1] ?? intel.socialNorms[i % intel.socialNorms.length] ?? "Aktif expat/yerel buluşma noktası",
    })),
    onlineSteps,
    offlineSteps,
    messageTemplates: [
      intel.conversationStarters[0] ?? `Merhaba! ${countryName} kültürüne ilgim var.`,
      "Profilinde [detay] dikkatimi çekti — hafta sonu kısa bir kahve/sohbet nasıl olur?",
      intel.firstDateIdeas[0]
        ? `Yeni keşfettiğim bir yer var: ${intel.firstDateIdeas[0]} — birlikte denemek ister misin?`
        : "Şehirde yeni bir etkinlik buldum, birlikte gitmek ister misin?",
    ],
    conversationStarters: intel.conversationStarters,
    bestSeason: intel.bestSeason,
    safetyNote: intel.safetyNote,
  };
}
