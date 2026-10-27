const REF_KEY = "eye-finder-ref";
const MY_CODE_KEY = "eye-finder-my-code";

function randomCode(): string {
  return `EF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function getMyReferralCode(): string {
  if (typeof window === "undefined") return "EF-DEMO";
  let code = localStorage.getItem(MY_CODE_KEY);
  if (!code) {
    code = randomCode();
    localStorage.setItem(MY_CODE_KEY, code);
  }
  return code;
}

export function captureReferralFromUrl(): void {
  if (typeof window === "undefined") return;
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref) localStorage.setItem(REF_KEY, ref);
}

export function getReferralSource(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REF_KEY);
}
