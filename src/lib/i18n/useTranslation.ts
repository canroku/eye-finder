"use client";

import { getLocale, type Locale } from "@/lib/i18n";
import { useSyncExternalStore } from "react";
import { t as translate } from "@/lib/i18n";

function subscribe(cb: () => void) {
  window.addEventListener("eye-finder-locale", cb);
  return () => window.removeEventListener("eye-finder-locale", cb);
}

function getSnapshot(): Locale {
  return getLocale();
}

function getServerSnapshot(): Locale {
  return "tr";
}

export function useTranslation() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    locale,
    t: (key: string) => translate(key, locale),
  };
}
