"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { apiFetch } from "@/lib/api";
import type { Notification } from "@/lib/notifications/store";

const PAGE_SIZE = 20;
type LoadState = "loading" | "ready" | "error";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const signedIn = !!user && !user.isGuest;
  const [items, setItems] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [offset, setOffset] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(async (nextOffset: number, onlyUnread: boolean) => {
    setState("loading");
    try {
      const qs = new URLSearchParams({
        offset: String(nextOffset),
        limit: String(PAGE_SIZE),
        ...(onlyUnread ? { unread: "1" } : {}),
      });
      const res = await apiFetch(`/api/notifications?${qs}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: Notification[]; total: number; unread: number };
      setItems(data.items);
      setTotal(data.total);
      setUnread(data.unread);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (signedIn) void load(offset, unreadOnly);
  }, [signedIn, offset, unreadOnly, load]);

  const markRead = async (id: string) => {
    const res = await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
    if (!res.ok) return;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnread((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    const res = await apiFetch("/api/notifications/read-all", { method: "POST" });
    if (!res.ok) return;
    void load(offset, unreadOnly);
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        label="Bildirimler"
        title="Bildirim merkezi"
        action={
          <button
            type="button"
            onClick={markAll}
            disabled={unread === 0}
            className="text-sm text-accent-soft disabled:opacity-40"
          >
            Tümünü okundu say
          </button>
        }
      />

      {authLoading ? null : !signedIn ? (
        <p className="mt-8 text-sm text-secondary">Bildirimleri görmek için giriş yapın.</p>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => {
                  setOffset(0);
                  setUnreadOnly(e.target.checked);
                }}
              />
              Yalnızca okunmamış
            </label>
            <span className="text-secondary">{unread} okunmamış</span>
          </div>

          {state === "loading" && <p className="mt-8 text-sm text-secondary">Yükleniyor…</p>}
          {state === "error" && (
            <div className="mt-8 text-sm">
              <p className="text-secondary">Bildirimler yüklenemedi.</p>
              <button type="button" onClick={() => load(offset, unreadOnly)} className="mt-2 text-accent-soft">
                Tekrar dene
              </button>
            </div>
          )}
          {state === "ready" && items.length === 0 && (
            <p className="mt-8 text-sm text-secondary">
              {unreadOnly ? "Okunmamış bildiriminiz yok." : "Henüz bildiriminiz yok."}
            </p>
          )}
          {state === "ready" && items.length > 0 && (
            <ul className="mt-6 divide-y divide-white/5">
              {items.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className={`text-sm ${n.readAt === null ? "font-medium" : "text-secondary"}`}>{n.title}</p>
                    <p className="text-sm text-secondary">{n.body}</p>
                    <p className="mt-1 text-xs text-secondary">{new Date(n.createdAt).toLocaleString("tr-TR")}</p>
                  </div>
                  {n.readAt === null && (
                    <button type="button" onClick={() => markRead(n.id)} className="shrink-0 text-xs text-accent-soft">
                      Okundu
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {state === "ready" && total > PAGE_SIZE && (
            <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Sayfalama">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                className="disabled:opacity-40"
              >
                Önceki
              </button>
              <span className="text-secondary">
                {page} / {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                className="disabled:opacity-40"
              >
                Sonraki
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
