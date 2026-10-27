# Eye Finder V1.2

Küresel ilgi analiz platformu.

## Stabilite İyileştirmeleri

- **IndexedDB** — fotoğraf + profil (localStorage quota sorunu giderildi)
- **Taslak otokayıt** — onboarding yarım kalsa devam edilebilir
- **KVKK / rıza adımı** — 18+, veri işleme, yüz analizi, arketip disclaimer
- **Global öğrenme** — sinyal kaydı + 100 eşiğinde dinamik matris güncelleme
- **API** — `POST/GET /api/signals` (yerel `data/signals.json`)
- **Unit testler** — `npm test` (vitest)
- **Skor breakdown** — Eye Score ve Country Affinity ağırlıkları görünür
- **Isı haritası** — ülke skorları görsel
- **Paylaşım** — sonuç panoya kopyalanır
- **Preset onboarding** — sosyal tip + yaşam tarzı hızlı seçim

## Çalıştırma

```bash
npm install
npm run dev
npm test
npm run build
```

## Veri Silme

Sonuçlar sayfası → **Verileri Sil** (IndexedDB tamamen temizlenir)

## Android APK

Uygulama **Capacitor** ile paketlenir; analiz ve sonuçlar cihazda çalışır (IndexedDB). Sunucu API'leri (geri bildirim, waitlist vb.) mobil APK'da yok — isteğe bağlı özellikler sessizce atlanır.

### Hazır APK

Derlenmiş debug APK:

`dist/EyeFinder-v0.2.0-beta-debug.apk` (~14 MB)

Telefona kopyalayıp **Bilinmeyen kaynaklardan yükleme** izni vererek kurabilirsiniz.

### Yeniden derlemek

Gereksinimler: **JDK 21**, **Android SDK** (ilk kurulum için `scripts/setup-android-sdk.ps1`).

```bash
npm run android:build
```

APK çıktısı: `android/app/build/outputs/apk/debug/app-debug.apk`

Android Studio ile açmak için: `npm run android:open`
