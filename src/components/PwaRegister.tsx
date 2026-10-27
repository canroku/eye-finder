"use client";

import { useEffect } from "react";

async function removeAllServiceWorkers(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}

/** SW yenileme dongusune yol aciyor — her ortamda kapali. */
export function PwaRegister() {
  useEffect(() => {
    void removeAllServiceWorkers();
  }, []);

  return null;
}
