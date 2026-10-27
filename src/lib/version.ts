import { COUNTRY_COUNT } from "@/lib/data/country-matrix";

export const APP_VERSION = "0.2.0";
export const BETA_LABEL = "Beta";

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.2.0",
    date: "2026-06-13",
    title: "Beta Lansman",
    items: [
      `${COUNTRY_COUNT} ülke kültürel uyum analizi`,
      "Global profil tipi özeti (Archetype)",
      "Tam sonuç raporu PNG/PDF export",
      "Ülke bazlı “Doğru mu?” geri bildirimi",
      "3 renk teması + TR/EN dil desteği",
      "PWA — ana ekrana ekle",
      "Beta waitlist & davet kodu",
      "Demo mod + paylaşım kartı",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-06-01",
    title: "Alpha",
    items: [
      "Yüz AI (68 landmark)",
      "20–80 soruluk kişilik testi",
      "Eye Score & ülke sıralaması",
      "Yerel depolama + KVKK sıfırlama",
    ],
  },
];
