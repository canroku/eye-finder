import type { EducationLevel, IncomeBand } from "@/lib/types";

export const EDUCATION_OPTIONS: { value: EducationLevel; label: string; score: number }[] = [
  { value: "high_school", label: "Lise", score: 40 },
  { value: "associate", label: "Ön Lisans", score: 55 },
  { value: "bachelor", label: "Lisans", score: 70 },
  { value: "master", label: "Yüksek Lisans", score: 85 },
  { value: "doctorate", label: "Doktora", score: 95 },
];

export const INCOME_OPTIONS: { value: IncomeBand; label: string }[] = [
  { value: "low", label: "Düşük" },
  { value: "lower_mid", label: "Orta Altı" },
  { value: "mid", label: "Orta" },
  { value: "upper_mid", label: "Orta Üstü" },
  { value: "high", label: "Yüksek" },
];

export const PROFESSION_PRESTIGE: Record<string, number> = {
  doctor: 95,
  lawyer: 90,
  engineer: 85,
  architect: 82,
  manager: 78,
  teacher: 72,
  developer: 80,
  designer: 70,
  entrepreneur: 75,
  student: 50,
  other: 55,
};

export const PROFESSION_OPTIONS = [
  { value: "doctor", label: "Doktor" },
  { value: "lawyer", label: "Avukat" },
  { value: "engineer", label: "Mühendis" },
  { value: "architect", label: "Mimar" },
  { value: "manager", label: "Yönetici" },
  { value: "teacher", label: "Öğretmen" },
  { value: "developer", label: "Yazılım Geliştirici" },
  { value: "designer", label: "Tasarımcı" },
  { value: "entrepreneur", label: "Girişimci" },
  { value: "student", label: "Öğrenci" },
  { value: "other", label: "Diğer" },
];

export const COUNTRY_OPTIONS = [
  { code: "TR", name: "Türkiye" },
  { code: "US", name: "Amerika Birleşik Devletleri" },
  { code: "GB", name: "Birleşik Krallık" },
  { code: "DE", name: "Almanya" },
  { code: "FR", name: "Fransa" },
  { code: "BR", name: "Brezilya" },
  { code: "PL", name: "Polonya" },
  { code: "RU", name: "Rusya" },
  { code: "UA", name: "Ukrayna" },
  { code: "IT", name: "İtalya" },
  { code: "ES", name: "İspanya" },
  { code: "GR", name: "Yunanistan" },
  { code: "CO", name: "Kolombiya" },
  { code: "AR", name: "Arjantin" },
  { code: "AU", name: "Avustralya" },
  { code: "CA", name: "Kanada" },
  { code: "SE", name: "İsveç" },
  { code: "NO", name: "Norveç" },
  { code: "JP", name: "Japonya" },
  { code: "KR", name: "Güney Kore" },
  { code: "OTHER", name: "Diğer" },
];

export const LANGUAGE_OPTIONS = [
  "Türkçe",
  "İngilizce",
  "Almanca",
  "Fransızca",
  "İspanyolca",
  "Rusça",
  "Arapça",
  "Portekizce",
  "İtalyanca",
  "Japonca",
  "Korece",
  "Diğer",
];

export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 10;
/** Her ek yüz tespitli fotoğraf analiz derinliğini artırır */
export const PHOTO_DEPTH_PER_FACE = 12;
export const PHOTO_DEPTH_PER_UPLOAD = 3;
export const PHOTO_SCORE_BONUS_PER_FACE = 4;
export const PHOTO_SCORE_BONUS_CAP = 15;
