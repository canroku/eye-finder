export type ThemeId = "amber" | "emerald" | "violet";

const KEY = "eye-finder-theme";

export interface ThemeOption {
  id: ThemeId;
  label: string;
  swatch: string;
}

export const THEMES: ThemeOption[] = [
  { id: "amber", label: "Rose", swatch: "#ff6b6b" },
  { id: "emerald", label: "Mint", swatch: "#34d399" },
  { id: "violet", label: "Lilac", swatch: "#a78bfa" },
];

export function getTheme(): ThemeId {
  if (typeof window === "undefined") return "amber";
  const stored = localStorage.getItem(KEY);
  return stored === "emerald" || stored === "violet" ? stored : "amber";
}

export function setTheme(theme: ThemeId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
