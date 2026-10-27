import type { DatingAppInfo } from "@/lib/types";
import { getRegistryEntry } from "@/lib/data/country-registry";
import type { ClusterId } from "@/lib/data/country-registry";
import { flagEmoji } from "@/lib/data/flag-emoji";

type AppDef = Omit<DatingAppInfo, "type"> & { type?: "global" | "local" };

const G = {
  tinder: {
    name: "Tinder",
    type: "global" as const,
    popularity: 90,
    activityLevel: "top" as const,
    description: "Global lider — swipe tabanlı eşleştirme",
    url: "https://tinder.com",
  },
  bumble: {
    name: "Bumble",
    type: "global" as const,
    popularity: 82,
    activityLevel: "high" as const,
    description: "Kadınların ilk mesaj attığı platform",
    url: "https://bumble.com",
  },
  badoo: {
    name: "Badoo",
    type: "global" as const,
    popularity: 78,
    activityLevel: "high" as const,
    description: "Avrupa ve Latin Amerika'da güçlü taban",
    url: "https://badoo.com",
  },
  hinge: {
    name: "Hinge",
    type: "global" as const,
    popularity: 76,
    activityLevel: "high" as const,
    description: "Uzun ilişki odaklı — 'silinmek için tasarlandı'",
    url: "https://hinge.co",
  },
  okcupid: {
    name: "OkCupid",
    type: "global" as const,
    popularity: 68,
    activityLevel: "medium" as const,
    description: "Soru-cevap profilleri ile eşleştirme",
    url: "https://www.okcupid.com",
  },
  happn: {
    name: "Happn",
    type: "global" as const,
    popularity: 65,
    activityLevel: "medium" as const,
    description: "Gerçek hayatta karşılaştığın kişilerle eşleş",
    url: "https://www.happn.com",
  },
  match: {
    name: "Match",
    type: "global" as const,
    popularity: 66,
    activityLevel: "medium" as const,
    description: "Köklü ciddi ilişki platformu",
    url: "https://www.match.com",
  },
  pof: {
    name: "Plenty of Fish",
    type: "global" as const,
    popularity: 58,
    activityLevel: "medium" as const,
    description: "Geniş ücretsiz kullanıcı tabanı",
    url: "https://www.pof.com",
  },
  tantan: {
    name: "Tantan",
    type: "global" as const,
    popularity: 80,
    activityLevel: "high" as const,
    description: "Hello Group — Asya'da swipe tabanlı lider",
    url: "https://tantanapp.com",
  },
  twinby: {
    name: "Twinby",
    type: "local" as const,
    popularity: 58,
    activityLevel: "niche" as const,
    description: "Uyumluluk testi odaklı — TR/RU'da yükselen",
    url: "https://twinby.com",
  },
  quackquack: {
    name: "QuackQuack",
    type: "local" as const,
    popularity: 62,
    activityLevel: "medium" as const,
    description: "Hindistan tier-2/3 şehirlerde güçlü yerel platform",
    url: "https://www.quackquack.in",
  },
  omi: {
    name: "Omi",
    type: "local" as const,
    popularity: 78,
    activityLevel: "high" as const,
    description: "Endonezya indirme lideri — genç kentli kullanıcılar",
    url: "https://www.omi.sg",
  },
  paktor: {
    name: "Paktor",
    type: "local" as const,
    popularity: 72,
    activityLevel: "high" as const,
    description: "Tayvan & Güneydoğu Asya bölgesel lider",
    url: "https://www.paktor.com",
  },
  soul: {
    name: "Soul",
    type: "local" as const,
    popularity: 72,
    activityLevel: "high" as const,
    description: "Çin Gen Z — ilgi/ruh eşleşmesi odaklı sosyal tanışma",
    url: "https://www.soulapp.cn",
  },
  momo: {
    name: "Momo",
    type: "local" as const,
    popularity: 90,
    activityLevel: "top" as const,
    description: "Hello Group — Çin'in en yüksek MAU tanışma/sosyal uygulaması",
    url: "https://www.immomo.com",
  },
};

function apps(...list: AppDef[]): DatingAppInfo[] {
  return list
    .map((a) => ({
      ...a,
      type: a.type ?? "global",
    }))
    .sort((a, b) => b.popularity - a.popularity);
}

/** Kaynak: Similarweb, Statista, Sensor Tower — güncelleme Haziran 2025 */
export const COUNTRY_APPS: Record<string, DatingAppInfo[]> = {
  TR: apps(
    { ...G.bumble, popularity: 90, activityLevel: "top", description: "Türkiye Google Play #1 (Similarweb 2025)" },
    { ...G.tinder, popularity: 88, activityLevel: "high", description: "İstanbul ve büyük şehirlerde #2" },
    { ...G.okcupid, popularity: 78, activityLevel: "high", description: "Google Play sıralamasında #3" },
    { ...G.badoo, popularity: 74, activityLevel: "medium" },
    { ...G.hinge, popularity: 70, activityLevel: "medium" },
    { ...G.happn, popularity: 66, activityLevel: "medium" },
    { name: "Siberalem", type: "local", popularity: 62, activityLevel: "medium", description: "Yerel ciddi ilişki/evlilik odaklı köklü platform", url: "https://www.siberalem.com" },
    { ...G.twinby, popularity: 58, activityLevel: "niche", description: "Uyumluluk testi — yükselen yerel alternatif" },
  ),
  US: apps(
    { ...G.tinder, popularity: 92, activityLevel: "top", description: "ABD ~75M MAU — en geniş kullanıcı tabanı" },
    { ...G.hinge, popularity: 88, activityLevel: "high", description: "2025'te #2 — ciddi ilişki odaklı" },
    { ...G.bumble, popularity: 76, activityLevel: "high", description: "Women-first model — paying user düşüş trendi" },
    { ...G.okcupid, popularity: 68, activityLevel: "medium" },
    { ...G.match, popularity: 62, activityLevel: "medium", description: "35+ ciddi ilişki segmenti" },
    { name: "Coffee Meets Bagel", type: "global", popularity: 52, activityLevel: "niche", description: "Kalite odaklı günlük eşleşme", url: "https://coffeemeetsbagel.com" },
  ),
  GB: apps(
    { ...G.hinge, popularity: 88, activityLevel: "top", description: "BK 2025 lideri — ciddi ilişki odaklı" },
    { ...G.tinder, popularity: 84, activityLevel: "high" },
    { ...G.bumble, popularity: 80, activityLevel: "high" },
    { ...G.badoo, popularity: 58, activityLevel: "medium" },
    { ...G.happn, popularity: 52, activityLevel: "niche" },
    { ...G.okcupid, popularity: 48, activityLevel: "niche" },
  ),
  CA: apps(
    { ...G.hinge, popularity: 86, activityLevel: "top", description: "Kanada'da Tinder'ı geçerek lider (2024–2025)" },
    { ...G.tinder, popularity: 84, activityLevel: "high" },
    { ...G.bumble, popularity: 80, activityLevel: "high" },
    { ...G.okcupid, popularity: 65, activityLevel: "medium" },
    { ...G.pof, popularity: 58, activityLevel: "medium", description: "Kanada kökenli — hâlâ geniş taban" },
  ),
  AU: apps(
    { ...G.hinge, popularity: 88, activityLevel: "top", description: "Avustralya 2025 indirme lideri" },
    { ...G.tinder, popularity: 84, activityLevel: "high" },
    { ...G.bumble, popularity: 80, activityLevel: "high" },
    { ...G.okcupid, popularity: 58, activityLevel: "medium" },
    { name: "RSVP", type: "local", popularity: 52, activityLevel: "niche", description: "Avustralya'nın yerel tanışma sitesi", url: "https://www.rsvp.com.au" },
  ),
  BR: apps(
    { ...G.tinder, popularity: 94, activityLevel: "top", description: "5.6M+ MAU — Rio ve São Paulo'da en yoğun (Sensor Tower Q1 2025)" },
    { ...G.badoo, popularity: 80, activityLevel: "high", description: "2.7M+ aylık aktif — güçlü #2" },
    { ...G.happn, popularity: 72, activityLevel: "high", description: "1.3M+ MAU — Brezilya'da #3 marka" },
    { ...G.bumble, popularity: 68, activityLevel: "medium" },
    { name: "Par Perfeito", type: "local", popularity: 62, activityLevel: "medium", description: "Match Group — Brezilya yerel markası", url: "https://www.parperfeito.com.br" },
    { name: "Inner Circle", type: "global", popularity: 48, activityLevel: "niche", description: "Seçici sosyal ağ tarzı tanışma", url: "https://www.theinnercircle.co" },
  ),
  MX: apps(
    { ...G.tinder, popularity: 90, activityLevel: "top", description: "Meksika'nın en indirilen tanışma uygulaması" },
    { ...G.badoo, popularity: 78, activityLevel: "high" },
    { ...G.bumble, popularity: 72, activityLevel: "high" },
    { ...G.hinge, popularity: 62, activityLevel: "medium" },
    { name: "Amor.com", type: "local", popularity: 55, activityLevel: "niche", description: "İspanyolca konuşan yerel platform", url: "https://www.amor.com" },
  ),
  CO: apps(
    { ...G.tinder, popularity: 88, activityLevel: "top", description: "Bogotá ve Medellín'de dominant" },
    { ...G.badoo, popularity: 78, activityLevel: "high" },
    { ...G.bumble, popularity: 70, activityLevel: "high" },
    { ...G.happn, popularity: 58, activityLevel: "medium" },
    { name: "Colombian Cupid", type: "local", popularity: 52, activityLevel: "niche", description: "Kolombiya odaklı tanışma sitesi", url: "https://www.colombiancupid.com" },
  ),
  AR: apps(
    { ...G.tinder, popularity: 86, activityLevel: "top", description: "Buenos Aires'te en yüksek trafik" },
    { ...G.badoo, popularity: 76, activityLevel: "high" },
    { ...G.bumble, popularity: 68, activityLevel: "medium" },
    { ...G.okcupid, popularity: 60, activityLevel: "medium" },
    { name: "Match.com.ar", type: "global", popularity: 48, activityLevel: "niche", description: "Match Group — Arjantin segmenti", url: "https://www.match.com" },
  ),
  CL: apps(
    { ...G.tinder, popularity: 84, activityLevel: "top" },
    { ...G.badoo, popularity: 76, activityLevel: "high" },
    { ...G.bumble, popularity: 68, activityLevel: "medium" },
    { ...G.hinge, popularity: 58, activityLevel: "niche" },
  ),
  PL: apps(
    { ...G.tinder, popularity: 86, activityLevel: "top", description: "Genç kentli kullanıcılar arasında lider" },
    { name: "Sympatia.pl", type: "local", popularity: 82, activityLevel: "high", description: "30+ ciddi ilişki — Polonya'nın yerel devi", url: "https://www.sympatia.pl" },
    { ...G.badoo, popularity: 76, activityLevel: "high", description: "Büyük şehir dışında geniş erişim" },
    { ...G.bumble, popularity: 65, activityLevel: "medium" },
    { name: "Edate", type: "local", popularity: 52, activityLevel: "niche", description: "Yerel flört platformu", url: "https://www.edate.pl" },
    { ...G.hinge, popularity: 48, activityLevel: "niche" },
  ),
  RU: apps(
    { name: "Mamba", type: "local", popularity: 92, activityLevel: "top", description: "Rusya'nın #1 platformu — 60M+ kayıtlı kullanıcı", url: "https://www.mamba.ru" },
    { name: "Teamo", type: "local", popularity: 72, activityLevel: "high", description: "Ciddi ilişki ve evlilik odaklı", url: "https://teamo.ru" },
    { ...G.tinder, popularity: 62, activityLevel: "medium", description: "Büyük şehirlerde orta düzey trafik" },
    { ...G.badoo, popularity: 58, activityLevel: "medium" },
    { name: "Pure", type: "global", popularity: 45, activityLevel: "niche", description: "Anonim kısa süreli tanışma", url: "https://pure.app" },
  ),
  UA: apps(
    { name: "Mamba", type: "local", popularity: 84, activityLevel: "top", description: "Ukrayna'da en yaygın yerel platform", url: "https://www.mamba.ua" },
    { ...G.tinder, popularity: 76, activityLevel: "high" },
    { ...G.badoo, popularity: 68, activityLevel: "medium" },
    { ...G.bumble, popularity: 55, activityLevel: "niche" },
  ),
  IT: apps(
    { ...G.tinder, popularity: 88, activityLevel: "top", description: "İtalya Google Play #1 (Similarweb 2025)" },
    { ...G.hinge, popularity: 84, activityLevel: "high", description: "Milano/Roma'da hızla büyüyen #2" },
    { ...G.bumble, popularity: 78, activityLevel: "high" },
    { ...G.badoo, popularity: 68, activityLevel: "medium" },
    { name: "Meetic", type: "local", popularity: 62, activityLevel: "medium", description: "Match Group — ciddi ilişki odaklı", url: "https://www.meetic.it" },
    { ...G.happn, popularity: 48, activityLevel: "niche" },
  ),
  ES: apps(
    { ...G.tinder, popularity: 88, activityLevel: "top", description: "İspanya Google Play #1 (Similarweb 2025)" },
    { ...G.bumble, popularity: 82, activityLevel: "high" },
    { ...G.hinge, popularity: 78, activityLevel: "high" },
    { ...G.badoo, popularity: 72, activityLevel: "medium", description: "Geniş taban — sıralamada #4" },
    { name: "Meetic", type: "local", popularity: 58, activityLevel: "medium", description: "Ciddi ilişki segmentinde yerel platform", url: "https://www.meetic.es" },
    { ...G.happn, popularity: 52, activityLevel: "niche" },
  ),
  GR: apps(
    { ...G.tinder, popularity: 86, activityLevel: "top" },
    { ...G.badoo, popularity: 78, activityLevel: "high" },
    { ...G.bumble, popularity: 66, activityLevel: "medium" },
    { ...G.happn, popularity: 52, activityLevel: "niche" },
  ),
  RS: apps(
    { ...G.tinder, popularity: 82, activityLevel: "top" },
    { ...G.badoo, popularity: 74, activityLevel: "high" },
    { ...G.bumble, popularity: 62, activityLevel: "medium" },
    { name: "Lovoo", type: "global", popularity: 55, activityLevel: "niche", description: "Balkanlarda tanınan platform", url: "https://www.lovoo.com" },
  ),
  HR: apps(
    { ...G.tinder, popularity: 84, activityLevel: "top" },
    { ...G.bumble, popularity: 72, activityLevel: "high" },
    { ...G.badoo, popularity: 70, activityLevel: "high" },
    { ...G.hinge, popularity: 55, activityLevel: "niche" },
  ),
  SE: apps(
    { ...G.tinder, popularity: 86, activityLevel: "top" },
    { ...G.hinge, popularity: 78, activityLevel: "high", description: "Stockholm'de ciddi ilişki trendi" },
    { ...G.bumble, popularity: 76, activityLevel: "high" },
    { ...G.badoo, popularity: 58, activityLevel: "medium" },
  ),
  NO: apps(
    { ...G.tinder, popularity: 85, activityLevel: "top" },
    { ...G.hinge, popularity: 78, activityLevel: "high" },
    { ...G.bumble, popularity: 74, activityLevel: "high" },
    { ...G.badoo, popularity: 55, activityLevel: "niche" },
  ),
  JP: apps(
    { name: "Pairs", type: "local", popularity: 92, activityLevel: "top", description: "Japonya #1 — 1.5M+ MAU, evlilik odaklı (Match Group)", url: "https://www.pairs.lv" },
    { name: "Omiai", type: "local", popularity: 80, activityLevel: "high", description: "Geleneksel değerler — evlilik platformu", url: "https://www.omiai-jp.com" },
    { name: "Tapple", type: "local", popularity: 72, activityLevel: "high", description: "Hobi tabanlı eşleştirme — Gen Z", url: "https://tapple.me" },
    { ...G.tinder, popularity: 68, activityLevel: "medium", description: "Yabancılar ve uluslararası segment" },
    { name: "With", type: "local", popularity: 58, activityLevel: "medium", description: "Çiftler için sosyal uygulama", url: "https://with.is" },
  ),
  KR: apps(
    { name: "Amanda", type: "local", popularity: 90, activityLevel: "top", description: "Güney Kore #1 — 5M+ kullanıcı, seçici üyelik", url: "https://www.amanda.co.kr" },
    { name: "Pairs", type: "local", popularity: 82, activityLevel: "high", description: "2025'te Kore pazarına girdi — evlilik odaklı AI eşleşme", url: "https://www.pairs.lv" },
    { name: "Noondate", type: "local", popularity: 74, activityLevel: "high", description: "Öğle/akşam günlük eşleştirme", url: "https://noondate.com" },
    { name: "GLAM", type: "local", popularity: 66, activityLevel: "high", description: "Cupist AI profil değerlendirme", url: "https://www.cupist.com" },
    { ...G.tinder, popularity: 62, activityLevel: "medium", description: "Expat ve uluslararası kullanıcılar" },
    { ...G.bumble, popularity: 50, activityLevel: "niche" },
  ),
  TH: apps(
    { ...G.tinder, popularity: 84, activityLevel: "top" },
    { name: "ThaiFriendly", type: "local", popularity: 80, activityLevel: "high", description: "Tayland'ın en büyük yerel tanışma sitesi", url: "https://www.thaifriendly.com" },
    { ...G.badoo, popularity: 72, activityLevel: "high" },
    { name: "ThaiCupid", type: "local", popularity: 62, activityLevel: "medium", description: "Cupid Media — yerel odaklı", url: "https://www.thaicupid.com" },
    { ...G.bumble, popularity: 55, activityLevel: "niche" },
  ),
  PH: apps(
    { ...G.tinder, popularity: 86, activityLevel: "top" },
    { name: "Filipino Cupid", type: "local", popularity: 78, activityLevel: "high", description: "Filipinler'in köklü yerel platformu", url: "https://www.filipinocupid.com" },
    { ...G.badoo, popularity: 72, activityLevel: "high" },
    { name: "PinaLove", type: "local", popularity: 65, activityLevel: "medium", description: "Yerel flört ve tanışma", url: "https://www.pinalove.com" },
    { ...G.bumble, popularity: 58, activityLevel: "medium" },
  ),
  DE: apps(
    { ...G.tinder, popularity: 88, activityLevel: "top", description: "Almanya'da en yüksek MAU" },
    { name: "Lovoo", type: "global", popularity: 76, activityLevel: "high", description: "Almanya kökenli sosyal tanışma", url: "https://www.lovoo.com" },
    { ...G.bumble, popularity: 74, activityLevel: "high" },
    { ...G.hinge, popularity: 68, activityLevel: "medium" },
    { name: "Parship", type: "local", popularity: 62, activityLevel: "medium", description: "Ciddi ilişki — kişilik testi", url: "https://www.parship.de" },
  ),
  FR: apps(
    { ...G.hinge, popularity: 88, activityLevel: "top", description: "Fransa Google Play #1 (Similarweb 2025)" },
    { ...G.tinder, popularity: 84, activityLevel: "high" },
    { ...G.badoo, popularity: 78, activityLevel: "high" },
    { ...G.happn, popularity: 72, activityLevel: "high", description: "Paris kökenli — konum tabanlı tanışma" },
    { name: "Meetic", type: "local", popularity: 68, activityLevel: "medium", description: "Ciddi ilişki — yerel köklü platform", url: "https://www.meetic.fr" },
    { ...G.bumble, popularity: 64, activityLevel: "medium" },
  ),
  NL: apps(
    { ...G.tinder, popularity: 84, activityLevel: "top" },
    { ...G.bumble, popularity: 78, activityLevel: "high" },
    { ...G.hinge, popularity: 70, activityLevel: "high" },
    { ...G.badoo, popularity: 58, activityLevel: "medium" },
  ),
  PT: apps(
    { ...G.badoo, popularity: 82, activityLevel: "top" },
    { ...G.tinder, popularity: 80, activityLevel: "high" },
    { ...G.bumble, popularity: 65, activityLevel: "medium" },
    { name: "Meetic.pt", type: "local", popularity: 58, activityLevel: "medium", description: "Portekiz ciddi ilişki segmenti", url: "https://www.meetic.pt" },
  ),
  RO: apps(
    { ...G.tinder, popularity: 82, activityLevel: "top" },
    { ...G.badoo, popularity: 76, activityLevel: "high" },
    { name: "Sentimente", type: "local", popularity: 68, activityLevel: "medium", description: "Romanya yerel platform", url: "https://www.sentimente.ro" },
    { ...G.bumble, popularity: 55, activityLevel: "niche" },
  ),
  CZ: apps(
    { ...G.tinder, popularity: 84, activityLevel: "top" },
    { ...G.badoo, popularity: 74, activityLevel: "high" },
    { name: "Seznamka", type: "local", popularity: 68, activityLevel: "medium", description: "Seznam.cz ekosistemi — yerel ciddi ilişki", url: "https://www.seznamka.cz" },
    { ...G.bumble, popularity: 62, activityLevel: "medium" },
  ),
  HU: apps(
    { ...G.tinder, popularity: 82, activityLevel: "top" },
    { ...G.badoo, popularity: 72, activityLevel: "high" },
    { name: "Randivonal", type: "local", popularity: 65, activityLevel: "medium", description: "Macaristan yerel tanışma", url: "https://www.randivonal.hu" },
  ),
  IE: apps(
    { ...G.tinder, popularity: 86, activityLevel: "top" },
    { ...G.bumble, popularity: 78, activityLevel: "high" },
    { ...G.hinge, popularity: 72, activityLevel: "high" },
    { ...G.pof, popularity: 58, activityLevel: "medium" },
  ),
  NZ: apps(
    { ...G.tinder, popularity: 86, activityLevel: "top" },
    { ...G.bumble, popularity: 78, activityLevel: "high" },
    { ...G.hinge, popularity: 70, activityLevel: "high" },
  ),
  SG: apps(
    { ...G.tinder, popularity: 84, activityLevel: "top" },
    { ...G.bumble, popularity: 76, activityLevel: "high" },
    { name: "Coffee Meets Bagel", type: "global", popularity: 68, activityLevel: "medium", description: "Singapur'da seçici kullanıcı kitlesi", url: "https://coffeemeetsbagel.com" },
    { ...G.hinge, popularity: 62, activityLevel: "medium" },
  ),
  MY: apps(
    { ...G.tinder, popularity: 88, activityLevel: "top", description: "Malezya Google Play #1 (Similarweb 2025)" },
    { ...G.bumble, popularity: 82, activityLevel: "high" },
    { ...G.tantan, popularity: 78, activityLevel: "high", description: "SEA'da güçlü #3 — swipe tabanlı" },
    { name: "Coffee Meets Bagel", type: "global", popularity: 62, activityLevel: "medium", description: "Seçici kullanıcı kitlesi", url: "https://coffeemeetsbagel.com" },
    { ...G.badoo, popularity: 52, activityLevel: "niche" },
  ),
  ID: apps(
    { ...G.tantan, popularity: 86, activityLevel: "top", description: "Endonezya Google Play #1 (Similarweb 2025)" },
    { ...G.tinder, popularity: 82, activityLevel: "high" },
    { ...G.omi, popularity: 80, activityLevel: "high", description: "Endonezya indirme lideri (Statista 2024)" },
    { ...G.bumble, popularity: 68, activityLevel: "medium" },
    { ...G.badoo, popularity: 58, activityLevel: "medium" },
  ),
  VN: apps(
    { ...G.tinder, popularity: 86, activityLevel: "top", description: "Vietnam Google Play #1 (Similarweb 2025)" },
    { ...G.bumble, popularity: 78, activityLevel: "high" },
    { name: "VietnamCupid", type: "local", popularity: 62, activityLevel: "medium", description: "Yerel odaklı tanışma platformu", url: "https://www.vietnamcupid.com" },
    { ...G.badoo, popularity: 58, activityLevel: "medium" },
  ),
  IN: apps(
    { ...G.tinder, popularity: 88, activityLevel: "top", description: "Hindistan Google Play #1 (Similarweb 2025)" },
    { ...G.bumble, popularity: 80, activityLevel: "high" },
    { name: "Aisle", type: "local", popularity: 72, activityLevel: "high", description: "Ciddi ilişki — yüksek niyetli kullanıcılar", url: "https://www.aisle.co" },
    { ...G.hinge, popularity: 66, activityLevel: "medium", description: "Metro Gen Z'de büyüyen global platform" },
    { name: "TrulyMadly", type: "local", popularity: 64, activityLevel: "medium", description: "Güven odaklı doğrulanmış profiller", url: "https://www.trulymadly.com" },
    { ...G.quackquack, popularity: 60, activityLevel: "medium" },
  ),
  CN: apps(
    { ...G.momo, popularity: 92, activityLevel: "top", description: "Çin #1 MAU — sosyal + tanışma (Statista 2025)" },
    { ...G.tantan, popularity: 88, activityLevel: "high", description: "Çin Tinder'ı — swipe tabanlı" },
    { ...G.soul, popularity: 72, activityLevel: "high" },
    { ...G.tinder, popularity: 52, activityLevel: "niche", description: "Expat segmenti — resmi mağaza dışı erişim" },
  ),
  TW: apps(
    { ...G.tinder, popularity: 88, activityLevel: "top", description: "Tayvan'da en yaygın global platform" },
    { ...G.bumble, popularity: 78, activityLevel: "high" },
    { ...G.paktor, popularity: 72, activityLevel: "high" },
    { ...G.tantan, popularity: 58, activityLevel: "medium", description: "Bölgesel alternatif — ikincil tercih" },
    { name: "Goodnight", type: "local", popularity: 52, activityLevel: "niche", description: "Gece sesli eşleşme — yerel Gen Z", url: "https://goodnight.io" },
  ),
  EG: apps(
    { ...G.tinder, popularity: 80, activityLevel: "top" },
    { ...G.badoo, popularity: 74, activityLevel: "high" },
    { name: "Muzz", type: "global", popularity: 62, activityLevel: "medium", description: "Müslüman tanışma segmenti", url: "https://muzz.com" },
  ),
  ZA: apps(
    { ...G.tinder, popularity: 84, activityLevel: "top" },
    { ...G.bumble, popularity: 72, activityLevel: "high" },
    { name: "South African Cupid", type: "local", popularity: 58, activityLevel: "medium", description: "Yerel tanışma sitesi", url: "https://www.southafricancupid.com" },
  ),
};

const CLUSTER_APP_DEFAULTS: Record<ClusterId, DatingAppInfo[]> = {
  latin: apps(
    { ...G.tinder, popularity: 90, activityLevel: "top", description: "Latin Amerika'da baskın global platform" },
    { ...G.badoo, popularity: 80, activityLevel: "high", description: "Güney Amerika ve Karayipler'de güçlü #2" },
    { ...G.bumble, popularity: 72, activityLevel: "high" },
    { ...G.hinge, popularity: 58, activityLevel: "niche", description: "Büyük şehirlerde büyüyen niş" },
  ),
  slav: apps(
    { ...G.badoo, popularity: 84, activityLevel: "top", description: "Doğu Avrupa'da yüksek MAU" },
    { ...G.tinder, popularity: 82, activityLevel: "high" },
    { ...G.bumble, popularity: 66, activityLevel: "medium" },
    { ...G.twinby, popularity: 52, activityLevel: "niche", description: "Doğu Avrupa'da uyumluluk odaklı alternatif" },
  ),
  balkan: apps(
    { ...G.tinder, popularity: 82, activityLevel: "top" },
    { ...G.badoo, popularity: 78, activityLevel: "high" },
    { ...G.bumble, popularity: 62, activityLevel: "medium" },
  ),
  mediterranean: apps(
    { ...G.tinder, popularity: 84, activityLevel: "top" },
    { ...G.hinge, popularity: 76, activityLevel: "high", description: "2025'te Akdeniz'de hızla büyüyen" },
    { ...G.badoo, popularity: 72, activityLevel: "high" },
    { ...G.bumble, popularity: 68, activityLevel: "medium" },
    { name: "Muzz", type: "global", popularity: 58, activityLevel: "medium", description: "MENA bölgesinde Müslüman tanışma", url: "https://muzz.com" },
  ),
  nordic: apps(
    { ...G.hinge, popularity: 84, activityLevel: "high", description: "Kuzey Avrupa'da ciddi ilişki trendi" },
    { ...G.tinder, popularity: 82, activityLevel: "top" },
    { ...G.bumble, popularity: 74, activityLevel: "high" },
    { ...G.okcupid, popularity: 55, activityLevel: "medium" },
  ),
  anglo: apps(
    { ...G.hinge, popularity: 86, activityLevel: "high", description: "Anglosphere'de ciddi ilişki lideri (2025)" },
    { ...G.tinder, popularity: 84, activityLevel: "top", description: "En geniş kullanıcı tabanı" },
    { ...G.bumble, popularity: 76, activityLevel: "high" },
    { ...G.match, popularity: 58, activityLevel: "medium" },
  ),
};

export function getAppsForCountry(code: string): DatingAppInfo[] {
  if (COUNTRY_APPS[code]) return COUNTRY_APPS[code];
  const entry = getRegistryEntry(code);
  if (entry) return CLUSTER_APP_DEFAULTS[entry.clusterId];
  return CLUSTER_APP_DEFAULTS.anglo;
}

export function getTopAppForCountry(code: string): DatingAppInfo | undefined {
  return getAppsForCountry(code)[0];
}

export const ACTIVITY_LABELS: Record<DatingAppInfo["activityLevel"], string> = {
  top: "En aktif",
  high: "Çok aktif",
  medium: "Aktif",
  niche: "Niş",
};

export function getCountryFlag(code: string): string {
  return flagEmoji(code);
}
