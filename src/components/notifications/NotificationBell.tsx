"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthProvider";
import type { Notification } from "@/lib/notifications/store";

type LoadState = "idle" | "loading" | "error";

export function NotificationBell() {
  const { user } = useAuth();
  const enabled = !!user && !user.isGuest;
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const wrapRef = useRef<HTMLDivElement>(null);

  const loadCount = useCallback(async () => {
    try {
      const res = await apiFetch("/api/notifications?limit=1");
      if (!res.ok) return;
      const data = (await res.json()) as { unread: number };
      setUnread(data.unread);
    } catch {
      // Badge is best-effort; the dropdown shows the error state on open.
    }
  }, []);

  const loadItems = useCallback(async () => {
    setState("loading");
    try {
      const res = await apiFetch("/api/notifications?limit=8");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: Notification[]; unread: number };
      setItems(data.items);
      setUnread(data.unread);
      setState("idle");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void loadCount();
  }, [enabled, loadCount]);

  useEffect(() => {
    if (!open) return;
    void loadItems();
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, loadItems]);

  const markRead = async (id: string) => {
    const res = await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
    if (!res.ok) return;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnread((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    const res = await apiFetch("/api/notifications/read-all", { method: "POST" });
    if (!res.ok) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
    setUnread(0);
  };

  if (!enabled) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Bildirimler, ${unread} okunmamış` : "Bildirimler"}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-accent-border bg-accent-dim text-accent"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" strokeLinejoin="round" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.1rem] rounded-full bg-accent px-1 text-[10px] font-semibold leading-[1.1rem] text-black tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-white/10 bg-surface p-2 shadow-xl">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium">Bildirimler</span>
            <button
              type="button"
              onClick={markAll}
              disabled={unread === 0}
              className="text-xs text-accent-soft disabled:opacity-40"
            >
              Tümünü okundu say
            </button>
          </div>

          {state === "loading" && <p className="px-2 py-6 text-center text-sm text-secondary">Yükleniyor…</p>}
          {state === "error" && (
            <div className="px-2 py-6 text-center text-sm">
              <p className="text-secondary">Bildirimler yüklenemedi.</p>
              <button type="button" onClick={loadItems} className="mt-2 text-accent-soft">
                Tekrar dene
              </button>
            </div>
          )}
          {state === "idle" && items.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-secondary">Henüz bildirim yok.</p>
          )}
          {state === "idle" && items.length > 0 && (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => n.readAt === null && markRead(n.id)}
                    className={`block w-full rounded-lg px-2 py-2 text-left hover:bg-white/5 ${
                      n.readAt === null ? "font-medium" : "text-secondary"
                    }`}
                  >
                    <span className="block text-sm">{n.title}</span>
                    <span className="block truncate text-xs text-secondary">{n.body}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-2 py-2 text-center text-sm text-accent-soft hover:bg-white/5"
          >
            Tüm bildirimler
          </Link>
        </div>
      )}
    </div>
  );
}
