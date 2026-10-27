import { INTRO_COOKIE, INTRO_STORAGE_KEY } from "@/lib/intro/constants";

/** Intro tamamlandı — cookie (middleware) + localStorage (client) */
export function markIntroComplete(): void {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    /* private mode */
  }
  document.cookie = `${INTRO_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`;
}

export function hasSeenIntroLocally(): boolean {
  try {
    return localStorage.getItem(INTRO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
