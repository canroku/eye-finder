"use client";

import { getLocale, setLocale, type Locale } from "@/lib/i18n";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("eye-finder-locale", onStoreChange);
  return () => window.removeEventListener("eye-finder-locale", onStoreChange);
}

function getSnapshot(): Locale {
  return getLocale();
}

function getServerSnapshot(): Locale {
  return "tr";
}

export function LanguageSwitcher() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Locale = locale === "tr" ? "en" : "tr";
    setLocale(next);
    document.documentElement.lang = next;
    window.dispatchEvent(new Event("eye-finder-locale"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-zinc-700/60 px-2 py-1 text-[10px] font-medium uppercase text-zinc-400 hover:border-accent-dim"
      aria-label="Dil değiştir"
    >
      {locale === "tr" ? "EN" : "TR"}
    </button>
  );
}
