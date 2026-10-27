"use client";

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const on = () => callback(true);
  const off = () => callback(false);
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
  };
}
