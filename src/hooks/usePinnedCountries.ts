"use client";

import { useCallback, useEffect, useState } from "react";
import { recordPinUsed } from "@/lib/engagement/store";

const STORAGE_KEY = "eye-finder-pinned-countries";

export function usePinnedCountries() {
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPinned(JSON.parse(raw) as string[]);
    } catch {
      setPinned([]);
    }
  }, []);

  const togglePin = useCallback((code: string) => {
    setPinned((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!prev.includes(code)) recordPinUsed();
      return next;
    });
  }, []);

  const isPinned = useCallback((code: string) => pinned.includes(code), [pinned]);

  return { pinned, togglePin, isPinned };
}
