"use client";

import type { SubscriptionTier } from "@/lib/subscription/tiers";
import { AUTH_CHANGED_EVENT, TIER_CHANGED_EVENT } from "@/lib/auth/constants";
import { apiFetch, IS_LOCAL_ONLY } from "@/lib/api";

// v2: eski kayıtlar (admin dahil) plan "free" ile takılı kalabiliyordu; yeni anahtar bunları temizler.
const LOCAL_SESSION_KEY = "ef_local_session_v2";
const LEGACY_LOCAL_SESSION_KEY = "ef_local_session";

/** Yerel (statik) modda admin yetkisi yalnızca bu e-postalar için verilir. */
export const LOCAL_ADMIN_EMAILS = ["admin@eyefinder.local"];

export interface AuthUser {
  id: string;
  email: string;
  tier: SubscriptionTier;
  tierExpiresAt: string | null;
  isAdmin?: boolean;
  isGuest?: boolean;
}

export function writeLocalSession(user: AuthUser | null): void {
  try {
    if (user) localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {
    /* private mode */
  }
}

function readLocalSession(): AuthUser | null {
  try {
    localStorage.removeItem(LEGACY_LOCAL_SESSION_KEY);
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    const isAdmin = LOCAL_ADMIN_EMAILS.includes(user.email.trim().toLowerCase());
    return { ...user, isAdmin };
  } catch {
    return null;
  }
}

export async function fetchSession(): Promise<AuthUser | null> {
  if (IS_LOCAL_ONLY) return readLocalSession();
  try {
    const res = await apiFetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: AuthUser | null };
    return data.user;
  } catch {
    return null;
  }
}

export function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function notifyTierChanged(): void {
  window.dispatchEvent(new Event(TIER_CHANGED_EVENT));
}
