"use client";

import { isOnline, onNetworkChange } from "@/lib/network";
import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  return onNetworkChange(() => cb());
}

function getSnapshot() {
  return isOnline();
}

function getServerSnapshot() {
  return true;
}

export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (online) return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-xl border border-accent-dim bg-accent-dim px-4 py-3 text-sm text-accent-soft"
    >
      Çevrimdışısın — analiz yerelde çalışır; sunucu senkronizasyonu bağlantı gelince devam eder.
    </div>
  );
}
