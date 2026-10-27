/**
 * Mobil (Capacitor) build'de API ayrı bir sunucuda çalışır.
 * NEXT_PUBLIC_API_BASE_URL boşsa istekler aynı origin'e gider (web).
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

/** Statik mobil APK: sunucu yok, tüm veri ve oturum cihazda (localStorage / IndexedDB). */
export const IS_LOCAL_ONLY = process.env.NEXT_PUBLIC_MOBILE_BUILD === "1";

/** GitHub Pages statik sürümü: sunucu API'si yok. */
export const IS_GITHUB_PAGES = process.env.NEXT_PUBLIC_GITHUB_PAGES === "1";

/** `/eye-finder` gibi repo alt yolu (yalnızca GitHub Pages build'inde dolu). */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** Kök-göreli public yolu (örn. "/maps/x.svg") basePath ile birleştirir. */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (IS_LOCAL_ONLY) {
    return Promise.resolve(
      new Response(JSON.stringify({ error: "Bu özellik yerel modda kullanılamıyor" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }
  return fetch(apiUrl(path), { credentials: "include", ...init });
}
