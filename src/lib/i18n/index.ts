export type Locale = "tr" | "en";

const KEY = "eye-finder-locale";

export const messages: Record<Locale, Record<string, string>> = {
  tr: {
    "nav.explore": "Keşfet",
    "nav.analyze": "Analiz",
    "nav.results": "Sonuçlar",
    "nav.settings": "Ayarlar",
    "nav.beta": "Beta",
    "home.tagline":
      "Yüz AI, kişilik ve kültürel uyum motoru ile dünyada nerede daha fazla ilgi görebileceğini keşfet.",
    "home.eyeScoreLine1": "Küresel",
    "home.eyeScoreLine2": "Eye Score'unu öğren",
    "home.start": "Analize Başla",
    "home.demo": "Demo Modu",
    "home.results": "Sonuçlarım",
    "home.betaCta": "Beta v0.2 yayında — sürüm notları",
    "home.feature.radar": "Radar Profil",
    "home.feature.radarDesc": "5 boyutlu analiz",
    "home.feature.countries": "Top Ülkeler",
    "home.feature.countriesDesc": "Kültürel uyum listesi",
    "home.feature.face": "Yüz AI",
    "home.feature.faceDesc": "Gerçek landmark tarama",
    "home.feature.insights": "Insights",
    "home.feature.insightsDesc": "Neden motoru",
    "results.title": "Dünyanı Keşfet",
    "results.hello": "Merhaba",
    "results.disclaimer":
      "Eşleştirme değil — küresel tercih uyumu analizi. Skorlar yargı değil, tahmindir.",
    "results.export": "Rapor İndir",
    "results.countryFeedback": "Ülke Geri Bildirimi",
    "results.profileType": "Global Profil Tipin",
    "results.noResult": "Henüz analiz sonucun yok.",
    "results.createProfile": "Profil Oluştur",
    "results.tryDemo": "Demo Modu Dene",
    "beta.title": "Eye Finder Beta",
    "beta.waitlist": "Beta Waitlist'e Katıl",
    "beta.changelog": "Sürüm Notları",
    "settings.title": "Ayarlar",
    "settings.appearance": "Görünüm",
    "settings.theme": "Arayüz rengi",
    "onboarding.title": "Analize Hazırlan",
    "onboarding.quick": "Hızlı (16 soru)",
    "onboarding.standard": "Standart (20 soru)",
    "onboarding.deep": "Derin (80 soru)",
    "pipeline.running": "Algoritma çalışıyor",
    "pipeline.prepare": "Fotoğraflar hazırlanıyor…",
    "pipeline.analyze": "Skor motorları çalışıyor…",
    "pipeline.save": "Sonuçlar kaydediliyor…",
    "pwa.install": "Ana ekrana ekle — uygulama gibi kullan",
  },
  en: {
    "nav.explore": "Explore",
    "nav.analyze": "Analyze",
    "nav.results": "Results",
    "nav.settings": "Settings",
    "nav.beta": "Beta",
    "home.tagline":
      "Discover where your profile may draw more interest worldwide — face AI, personality & cultural fit.",
    "home.eyeScoreLine1": "Discover your",
    "home.eyeScoreLine2": "Global Eye Score",
    "home.start": "Start Analysis",
    "home.demo": "Demo Mode",
    "home.results": "My Results",
    "home.betaCta": "Beta v0.2 is live — release notes",
    "home.feature.radar": "Radar Profile",
    "home.feature.radarDesc": "5-dimensional analysis",
    "home.feature.countries": "Top Countries",
    "home.feature.countriesDesc": "Cultural affinity list",
    "home.feature.face": "Face AI",
    "home.feature.faceDesc": "Real landmark scan",
    "home.feature.insights": "Insights",
    "home.feature.insightsDesc": "Reason engine",
    "results.title": "Explore Your World",
    "results.hello": "Hello",
    "results.disclaimer":
      "Not a matching app — global preference fit analysis. Scores are estimates, not judgments.",
    "results.export": "Download Report",
    "results.countryFeedback": "Country Feedback",
    "results.profileType": "Your Global Profile Type",
    "results.noResult": "No analysis results yet.",
    "results.createProfile": "Create Profile",
    "results.tryDemo": "Try Demo Mode",
    "beta.title": "Eye Finder Beta",
    "beta.waitlist": "Join Beta Waitlist",
    "beta.changelog": "Release Notes",
    "settings.title": "Settings",
    "settings.appearance": "Appearance",
    "settings.theme": "Interface color",
    "onboarding.title": "Prepare for Analysis",
    "onboarding.quick": "Quick (16 questions)",
    "onboarding.standard": "Standard (20 questions)",
    "onboarding.deep": "Deep (80 questions)",
    "pipeline.running": "Running algorithm",
    "pipeline.prepare": "Preparing photos…",
    "pipeline.analyze": "Running score engines…",
    "pipeline.save": "Saving results…",
    "pwa.install": "Add to home screen — use like an app",
  },
};

export function getLocale(): Locale {
  if (typeof window === "undefined") return "tr";
  const stored = localStorage.getItem(KEY);
  return stored === "en" ? "en" : "tr";
}

export function setLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, locale);
  document.documentElement.lang = locale;
}

export function t(key: string, locale?: Locale): string {
  const loc = locale ?? (typeof window !== "undefined" ? getLocale() : "tr");
  return messages[loc][key] ?? messages.tr[key] ?? key;
}
