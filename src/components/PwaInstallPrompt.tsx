"use client";

import { useSyncExternalStore } from "react";

function getMobileSnapshot() {
  if (typeof window === "undefined") return false;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);
  if (standalone) return false;
  return /iPhone|iPad|Android/i.test(navigator.userAgent);
}

function subscribe() {
  return () => {};
}

export function InstallPrompt() {
  const show = useSyncExternalStore(subscribe, getMobileSnapshot, () => false);

  if (!show) return null;

  return (
    <div className="rounded-xl border border-accent-dim bg-accent-dim px-4 py-3 text-xs text-accent-soft">
      📲 Ana ekrana ekle — uygulama gibi kullan (PWA Beta)
    </div>
  );
}
