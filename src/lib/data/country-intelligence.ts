import { getClusterForCountry } from "@/lib/data/clusters";
import { COUNTRY_MATRIX } from "@/lib/data/country-matrix";
import { getRegistryMeta } from "@/lib/data/country-registry";

export interface CountryIntel {
  code: string;
  name: string;
  clusterName: string;
  capital: string;
  languages: string[];
  timezone: string;
  currency: string;
  datingDirectness: number;
  datingPace: "hızlı" | "kademeli" | "orta";
  appVsRealLife: string;
  firstDateIdeas: string[];
  greetingStyle: string;
  culturalStrengths: string[];
  socialNorms: string[];
  taboos: string[];
  lifestyleScores: {
    nightlife: number;
    outdoor: number;
    fitness: number;
    expatFriendly: number;
  };
  avgDateCost: string;
  englishLevel: number;
  safetyNote: string;
  bestSeason: string;
  conversationStarters: string[];
  profileTips: string[];
  meetingPlaces: string[];
  localCustoms: string[];
}

const META: Record<string, Pick<CountryIntel, "capital" | "languages" | "timezone" | "currency" | "avgDateCost">> =
  Object.fromEntries(
    COUNTRY_MATRIX.map((c) => {
      const reg = getRegistryMeta(c.code);
      if (!reg) return null;
      return [
        c.code,
        {
          capital: reg.capital,
          languages: reg.languages,
          timezone: reg.timezone,
          currency: reg.currency,
          avgDateCost: reg.avgDateCost,
        },
      ] as const;
    }).filter((x): x is [string, Pick<CountryIntel, "capital" | "languages" | "timezone" | "currency" | "avgDateCost">] => x != null),
  );

const OVERRIDES: Partial<Record<string, Partial<CountryIntel>>> = {
  TR: {
    datingDirectness: 6,
    datingPace: "orta",
    appVsRealLife: "App'ler büyük şehirlerde güçlü; aile/arkadaş çevresi tanışmaları hâlâ yaygın.",
    firstDateIdeas: ["Boğaz yürüyüşü + çay", "Karaköy/Moda kahve", "Sokak lezzetleri turu"],
    greetingStyle: "Sıcak selamlaşma; ilk buluşmada nezaket ve tempo önemli.",
    culturalStrengths: ["Misafirperverlik", "Sosyal yemek kültürü", "Canlı şehir hayatı"],
    socialNorms: ["İlk buluşmada saygılı mesafe", "Aile değerleri konuşulabilir", "Geç saat sosyalleşme normal"],
    taboos: ["Aşırı baskıcı flört", "Politik polemikle açılış"],
    englishLevel: 4,
    safetyNote: "Kalabalık bölgelerde standart şehir güvenliği yeterli.",
    bestSeason: "Nisan–Haziran, Eylül–Kasım",
    conversationStarters: [
      "İstanbul'da en sevdiğin mahalle hangisi?",
      "Hafta sonu genelde ne yapmayı seversin?",
      "Türk kahvesi mi çay mı?",
    ],
    profileTips: [
      "1 net yüz fotoğrafı + 1 sosyal/şehir fotoğrafı kullan",
      "Bio'da ilgi alanı + şehir belirt",
      "Aşırı filtre yerine doğal poz tercih et",
    ],
    meetingPlaces: ["Kadıköy/Beşiktaş kafeler", "Dil değişim buluşmaları", "Spor/grup etkinlikleri"],
    localCustoms: ["Çay/kahve ikramı sosyal bağ kurar", "Grup buluşmaları daha rahat başlangıç"],
  },
  US: {
    datingDirectness: 8,
    datingPace: "hızlı",
    appVsRealLife: "App kültürü baskın; bar/etkinlik tanışmaları da yaygın.",
    firstDateIdeas: ["Coffee date", "Museum + brunch", "Park walk + ice cream"],
    greetingStyle: "Doğrudan ve samimi; ortak ilgi hızlı kapı açar.",
    culturalStrengths: ["Çeşitlilik", "Girişimcilik", "Açık iletişim"],
    englishLevel: 10,
    bestSeason: "İlkbahar ve erken sonbahar",
    conversationStarters: ["What's your go-to weekend spot?", "Any hidden gem in the city?", "Favorite podcast or show lately?"],
    profileTips: ["Show personality in bio", "Mix solo + hobby photos", "Be clear about intent (casual/serious)"],
    meetingPlaces: ["Meetup groups", "Running clubs", "Coworking socials"],
    localCustoms: ["Splitting the bill is common", "Small talk opens doors quickly"],
  },
  JP: {
    datingDirectness: 4,
    datingPace: "kademeli",
    appVsRealLife: "App kullanımı artıyor; güven inşa etmek zaman alır.",
    firstDateIdeas: ["Kafe + kısa yürüyüş", "Müze/sergi", "Ramen/kafe buluşması"],
    greetingStyle: "Nazik ve sabırlı iletişim; acele etme.",
    culturalStrengths: ["Nezaket", "Disiplin", "Güvenlik"],
    englishLevel: 3,
    bestSeason: "Mart–Mayıs, Ekim–Kasım",
    conversationStarters: ["お気に入りのカフェは？ (Favori kafen?)", "Şehirde en sevdiğin mevsim?", "Hobi olarak ne yapıyorsun?"],
    profileTips: ["Temiz, net portre kullan", "Bio kısa ve samimi olsun", "Tutarlı stil mesajı ver"],
    meetingPlaces: ["Language exchange", "Hobby circles", "Seasonal festivals"],
    localCustoms: ["Zamanında gelmek önemli", "İlk buluşma kısa tutulabilir"],
  },
  BR: {
    datingDirectness: 7,
    datingPace: "hızlı",
    appVsRealLife: "App + sosyal etkinlikler güçlü; sıcak iletişim beklenir.",
    firstDateIdeas: ["Plaj gün batımı", "Samba/live müzik", "Açık hava piknik"],
    englishLevel: 4,
    bestSeason: "Nisan–Eylül (güney), kuru mevsim kuzeydoğu",
    conversationStarters: ["Qual bairro você curte?", "Fim de semana na praia ou cidade?", "Música favorita agora?"],
    profileTips: ["Gülümseyen fotoğraflar", "Sosyal enerji göster", "Portekizce bio artı puan"],
    meetingPlaces: ["Praia/bar events", "Dance classes", "Expat meetups"],
    localCustoms: ["Fiziksel sıcaklık normal", "Grup arkadaşlarıyla tanışma yaygın"],
  },
};

function clusterDefaults(clusterId: string): Omit<CountryIntel, "code" | "name" | "clusterName"> {
  const presets: Record<string, Omit<CountryIntel, "code" | "name" | "clusterName">> = {
    latin: {
      capital: "—",
      languages: ["Yerel dil"],
      timezone: "UTC-3…-6",
      currency: "Yerel",
      datingDirectness: 7,
      datingPace: "hızlı",
      appVsRealLife: "App ve sosyal etkinlikler dengeli; sıcak iletişim beklenir.",
      firstDateIdeas: ["Canlı müzik/bar", "Açık hava yürüyüşü", "Yerel lezzet turu"],
      greetingStyle: "Sıcak ve ifade dolu selamlaşma.",
      culturalStrengths: ["Sosyallik", "Duygusal ifade", "Aile bağları"],
      socialNorms: ["Grup ortamlarında tanışma doğal", "Fiziksel sıcaklık normal sayılabilir"],
      taboos: ["Soğuk ve mesafeli iletişim", "Saygısız flört"],
      lifestyleScores: { nightlife: 80, outdoor: 65, fitness: 70, expatFriendly: 60 },
      avgDateCost: "Orta bütçe",
      englishLevel: 4,
      safetyNote: "Turistik bölgelerde standart dikkat yeterli.",
      bestSeason: "Kuru mevsim tercih edilir",
      conversationStarters: ["En sevdiğin şehir mekanı?", "Hafta sonu planın ne?", "Müzik zevkin nasıl?"],
      profileTips: ["Enerjik fotoğraflar", "Sosyal aktivite göster", "Bio'da mizah kullan"],
      meetingPlaces: ["Dans/salsa etkinlikleri", "Plaj/bar buluşmaları", "Expat grupları"],
      localCustoms: ["Geç saat sosyalleşme normal", "Arkadaş çevresi tanıştırması yaygın"],
    },
    slav: {
      capital: "—",
      languages: ["Yerel Slav dili"],
      timezone: "UTC+1…+3",
      currency: "Yerel",
      datingDirectness: 5,
      datingPace: "kademeli",
      appVsRealLife: "App kullanımı artıyor; ciddi niyet genelde takdir edilir.",
      firstDateIdeas: ["Kafe sohbeti", "Park yürüyüşü", "Kültür etkinliği"],
      greetingStyle: "Saygılı ve net iletişim.",
      culturalStrengths: ["Sadakat", "Eğitim", "Derin sohbet"],
      socialNorms: ["Ciddi niyet göstermek artı", "Aile değerleri önemli"],
      taboos: ["Yüzeysel flört", "Saygısız davranış"],
      lifestyleScores: { nightlife: 45, outdoor: 55, fitness: 55, expatFriendly: 55 },
      avgDateCost: "Uygun–orta",
      englishLevel: 5,
      safetyNote: "Standart şehir güvenliği uygula.",
      bestSeason: "İlkbahar–yaz",
      conversationStarters: ["Hangi şehir seni en çok yansıtıyor?", "Boş zamanlarında ne yaparsın?", "Seyahat planın var mı?"],
      profileTips: ["Kaliteli portre", "Ciddi ama sıcak bio", "Tutarlı profil bilgisi"],
      meetingPlaces: ["Language cafés", "Kültür etkinlikleri", "Spor salonu/gruplar"],
      localCustoms: ["Hediye/çiçek jesti takdir edilir", "Dürüstlük önemli"],
    },
    balkan: {
      capital: "—",
      languages: ["Yerel dil"],
      timezone: "UTC+1…+2",
      currency: "Yerel",
      datingDirectness: 6,
      datingPace: "orta",
      appVsRealLife: "App + arkadaş çevresi tanışmaları birlikte.",
      firstDateIdeas: ["Kafe", "Gece yürüyüşü", "Canlı müzik"],
      greetingStyle: "Sıcak ama saygılı.",
      culturalStrengths: ["Misafirperverlik", "Sosyallik", "Gurme kültür"],
      socialNorms: ["Grup buluşmaları yaygın", "Nezaket önemli"],
      taboos: ["Etik olmayan flört", "Politik kavgalar"],
      lifestyleScores: { nightlife: 65, outdoor: 60, fitness: 55, expatFriendly: 58 },
      avgDateCost: "Uygun",
      englishLevel: 5,
      safetyNote: "Turistik alanlarda normal dikkat.",
      bestSeason: "Mayıs–Eylül",
      conversationStarters: ["En sevdiğin Balkan yemeği?", "Hafta sonu nereye gidersin?", "Müzik/festival ilgin var mı?"],
      profileTips: ["Doğal gülümseme", "Hobi vurgula", "Yerel dil cümlesi ekle"],
      meetingPlaces: ["Kafeler", "Festival/etkinlikler", "Spor grupları"],
      localCustoms: ["Misafir ağırlama kültürü güçlü"],
    },
    mediterranean: {
      capital: "—",
      languages: ["Yerel dil"],
      timezone: "UTC+1…+3",
      currency: "Yerel/EUR",
      datingDirectness: 6,
      datingPace: "orta",
      appVsRealLife: "App + sosyal mekan tanışmaları dengeli.",
      firstDateIdeas: ["Sunset walk", "Wine/coffee", "Old town tour"],
      greetingStyle: "Sıcak ve duygusal iletişim.",
      culturalStrengths: ["Yemek kültürü", "Sanat", "Aile"],
      socialNorms: ["Geç saat yemek sosyalleşmesi", "Nezaket + mizah"],
      taboos: ["Kaba iletişim", "Aşırı acele"],
      lifestyleScores: { nightlife: 72, outdoor: 70, fitness: 62, expatFriendly: 65 },
      avgDateCost: "Orta",
      englishLevel: 5,
      safetyNote: "Turistik bölgelerde standart önlem.",
      bestSeason: "Nisan–Haziran, Eylül–Ekim",
      conversationStarters: ["En sevdiğin sahil/şehir?", "Yemek mi sanat mı?", "Hafta sonu ritüelin?"],
      profileTips: ["Stil tutarlılığı", "Sosyal fotoğraf ekle", "Bio'da tutku belirt"],
      meetingPlaces: ["Wine bars", "Plaj/kafe", "Sanat etkinlikleri"],
      localCustoms: ["Yemek paylaşımı bağ kurar"],
    },
    nordic: {
      capital: "—",
      languages: ["Yerel dil", "İngilizce"],
      timezone: "UTC+1…+2",
      currency: "Yerel",
      datingDirectness: 7,
      datingPace: "kademeli",
      appVsRealLife: "App yaygın; eşitlik ve net iletişim beklenir.",
      firstDateIdeas: ["Fika/kafe", "Doğa yürüyüşü", "Müze"],
      greetingStyle: "Doğrudan ama saygılı; kişisel alan önemli.",
      culturalStrengths: ["Eşitlik", "Güvenilirlik", "Doğa"],
      socialNorms: ["Eşit paylaşım", "Zamanında gelmek"],
      taboos: ["Baskıcı davranış", "Abartılı flört"],
      lifestyleScores: { nightlife: 45, outdoor: 85, fitness: 78, expatFriendly: 80 },
      avgDateCost: "Yüksek ama şeffaf",
      englishLevel: 8,
      safetyNote: "Genelde yüksek güvenlik; standart dikkat yeterli.",
      bestSeason: "Haziran–Ağustos (kuzey), ilkbahar",
      conversationStarters: ["Favorite outdoor spot?", "Work-life balance nasıl?", "Şehirde gizli mekan?"],
      profileTips: ["Doğal fotoğraflar", "Net niyet", "Outdoor/hobi göster"],
      meetingPlaces: ["Outdoor clubs", "Language cafés", "Coworking events"],
      localCustoms: ["Fika/ kahve molası sosyalleşme", "Eşitlik vurgusu"],
    },
    anglo: {
      capital: "—",
      languages: ["İngilizce"],
      timezone: "UTC-8…+11",
      currency: "Yerel",
      datingDirectness: 8,
      datingPace: "hızlı",
      appVsRealLife: "App-first kültür; etkinlik tanışmaları da güçlü.",
      firstDateIdeas: ["Coffee", "Pub quiz night", "Hike + brunch"],
      greetingStyle: "Casual, humor-friendly.",
      culturalStrengths: ["Diversity", "Direct talk", "Hobby groups"],
      socialNorms: ["Split bill common", "Clear communication valued"],
      taboos: ["Love-bombing", "Disrespectful jokes"],
      lifestyleScores: { nightlife: 60, outdoor: 72, fitness: 70, expatFriendly: 75 },
      avgDateCost: "Orta–yüksek",
      englishLevel: 10,
      safetyNote: "Standart şehir güvenliği.",
      bestSeason: "İlkbahar–sonbahar",
      conversationStarters: ["Best hidden spot in town?", "What are you passionate about?", "Ideal Sunday?"],
      profileTips: ["Authentic photos", "Specific bio hooks", "Show hobbies clearly"],
      meetingPlaces: ["Meetup", "Sports leagues", "Volunteering events"],
      localCustoms: ["Small talk opens doors", "Humor helps bonding"],
    },
  };

  return presets[clusterId] ?? presets.mediterranean;
}

export function getCountryIntel(code: string, countryName?: string): CountryIntel {
  const entry = COUNTRY_MATRIX.find((c) => c.code === code);
  const cluster = getClusterForCountry(code);
  const base = clusterDefaults(entry?.clusterId ?? cluster.id);
  const meta = META[code] ?? {
    capital: "—",
    languages: base.languages,
    timezone: base.timezone,
    currency: base.currency,
    avgDateCost: base.avgDateCost,
  };
  const override = OVERRIDES[code] ?? {};
  const registry = getRegistryMeta(code);

  return {
    code,
    name: countryName ?? entry?.name ?? code,
    clusterName: cluster.name,
    ...base,
    ...meta,
    ...override,
    englishLevel: override.englishLevel ?? registry?.englishLevel ?? base.englishLevel,
    lifestyleScores: { ...base.lifestyleScores, ...override.lifestyleScores },
    firstDateIdeas: override.firstDateIdeas ?? base.firstDateIdeas,
    conversationStarters: override.conversationStarters ?? base.conversationStarters,
    profileTips: override.profileTips ?? base.profileTips,
    meetingPlaces: override.meetingPlaces ?? base.meetingPlaces,
    localCustoms: override.localCustoms ?? base.localCustoms,
    culturalStrengths: override.culturalStrengths ?? base.culturalStrengths,
    socialNorms: override.socialNorms ?? base.socialNorms,
    taboos: override.taboos ?? base.taboos,
  };
}

export function buildPersonalizedStarters(
  intel: CountryIntel,
  userCity?: string,
): string[] {
  const city = userCity ?? "şehrin";
  return [
    ...intel.conversationStarters.slice(0, 2),
    `${intel.name}'e gelince ${city}'den farklı ne dikkatini çekti?`,
    `İlk buluşmada ${intel.firstDateIdeas[0]?.toLowerCase() ?? "kafe"} tarzı sana uygun mu?`,
  ];
}

export type SortKey =
  | "affinity"
  | "physical"
  | "lifestyle"
  | "personality"
  | "relationship"
  | "social";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "affinity", label: "Uyuma göre" },
  { key: "physical", label: "Fiziksel" },
  { key: "lifestyle", label: "Yaşam tarzı" },
  { key: "personality", label: "Kişilik" },
  { key: "relationship", label: "İlişki" },
  { key: "social", label: "Sosyal" },
];

import type { CountryResult } from "@/lib/types";

export function sortCountries(
  countries: CountryResult[],
  key: SortKey,
  pinned: string[] = [],
): CountryResult[] {
  const sorted = [...countries].sort((a, b) => {
    const av = key === "affinity" ? a.compatibility.affinity : a.compatibility[key];
    const bv = key === "affinity" ? b.compatibility.affinity : b.compatibility[key];
    return bv - av;
  });
  if (!pinned.length) return sorted;
  const pinSet = new Set(pinned);
  const pinnedList = pinned
    .map((code) => sorted.find((c) => c.compatibility.countryCode === code))
    .filter((c): c is CountryResult => Boolean(c));
  const rest = sorted.filter((c) => !pinSet.has(c.compatibility.countryCode));
  return [...pinnedList, ...rest];
}
