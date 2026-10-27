"use client";

import { applyTheme, getTheme, setTheme, THEMES, type ThemeId } from "@/lib/theme";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("eye-finder-theme", onStoreChange);
  return () => window.removeEventListener("eye-finder-theme", onStoreChange);
}

function getSnapshot(): ThemeId {
  return getTheme();
}

function getServerSnapshot(): ThemeId {
  return "amber";
}

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const pick = (id: ThemeId) => {
    setTheme(id);
    applyTheme(id);
    window.dispatchEvent(new Event("eye-finder-theme"));
  };

  if (compact) {
    return (
      <div className="flex gap-1" role="group" aria-label="Renk teması">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => pick(t.id)}
            className={`h-7 w-7 rounded-full border-2 transition ${
              theme === t.id ? "border-white scale-110" : "border-zinc-700 hover:border-zinc-500"
            }`}
            style={{ backgroundColor: t.swatch }}
            aria-pressed={theme === t.id}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-400">Arayüz rengi</p>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
              theme === t.id
                ? "border-accent bg-accent-dim text-accent-soft"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
            aria-pressed={theme === t.id}
          >
            <span
              className="h-8 w-8 rounded-full ring-2 ring-zinc-800"
              style={{ backgroundColor: t.swatch }}
            />
            <span className="text-xs font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
