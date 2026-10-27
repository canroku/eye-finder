export interface EngagementState {
  streak: number;
  longestStreak: number;
  lastVisitDate: string | null;
  totalVisits: number;
  achievements: string[];
  dreamCountries: string[];
  dailyCompleted: { date: string; ids: string[] };
  stats: {
    analysesCompleted: number;
    countriesViewed: number;
    comparisonsDone: number;
    sharesDone: number;
    pinsUsed: number;
  };
  viewedCountryCodes: string[];
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export interface DailyMissionDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_analysis", title: "İlk Keşif", description: "İlk analizini tamamladın", emoji: "🌍" },
  { id: "streak_3", title: "3 Gün Serisi", description: "3 gün üst üste uygulamaya girdin", emoji: "🔥" },
  { id: "streak_7", title: "Haftalık Ritim", description: "7 günlük seri yakaladın", emoji: "⚡" },
  { id: "explorer_5", title: "Gezgin", description: "5 farklı ülke detayı inceledin", emoji: "🧭" },
  { id: "comparator", title: "Kıyas Ustası", description: "İlk ülke karşılaştırmanı yaptın", emoji: "⚖️" },
  { id: "dream_set", title: "Hedef Belirledin", description: "Hayal ülkeni seçtin", emoji: "🎯" },
  { id: "pin_master", title: "Sabitleyici", description: "Favori ülke sabitledin", emoji: "★" },
  { id: "sharer", title: "Paylaşımcı", description: "Sonucunu paylaştın", emoji: "📤" },
  { id: "score_70", title: "Eye Score 70+", description: "Global skorun 70'i geçti", emoji: "👁️" },
  { id: "score_85", title: "Eye Score 85+", description: "Global skorun 85'i geçti", emoji: "💫" },
];

export const DAILY_MISSION_POOL: DailyMissionDef[] = [
  { id: "visit_app", title: "Günaydın keşifçi", description: "Uygulamayı aç", emoji: "☀️" },
  { id: "open_results", title: "Haritana bak", description: "Sonuçlar sayfasını ziyaret et", emoji: "🗺️" },
  { id: "view_country", title: "Ülke derinlemesine", description: "Bir ülke detayını aç", emoji: "🔍" },
  { id: "compare", title: "Kıyasla", description: "2 ülkeyi karşılaştır", emoji: "⚖️" },
  { id: "pin_country", title: "Favori ekle", description: "Bir ülkeyi sabitle", emoji: "📌" },
  { id: "check_journey", title: "Yolculuğunu gör", description: "Yolculuk sayfasına git", emoji: "🛤️" },
];

export const ENGAGEMENT_EVENT = "eye-finder-engagement-changed";

export function emptyEngagementState(): EngagementState {
  return {
    streak: 0,
    longestStreak: 0,
    lastVisitDate: null,
    totalVisits: 0,
    achievements: [],
    dreamCountries: [],
    dailyCompleted: { date: "", ids: [] },
    stats: {
      analysesCompleted: 0,
      countriesViewed: 0,
      comparisonsDone: 0,
      sharesDone: 0,
      pinsUsed: 0,
    },
    viewedCountryCodes: [],
  };
}
