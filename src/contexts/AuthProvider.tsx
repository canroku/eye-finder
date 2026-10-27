"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SubscriptionTier } from "@/lib/subscription/tiers";
import {
  fetchSession,
  notifyAuthChanged,
  notifyTierChanged,
  writeLocalSession,
  type AuthUser,
} from "@/lib/auth/session-client";
import { setCachedAuthUser } from "@/lib/subscription/client";
import { mergeCloudDataIntoLocal } from "@/lib/storage";
import { AUTH_CHANGED_EVENT } from "@/lib/auth/constants";
import { apiFetch, IS_LOCAL_ONLY } from "@/lib/api";

/** Mobil APK'da sunucu yok: oturum yalnızca cihazda tutulur. */
const LOCAL_GUEST: AuthUser = {
  id: "local-guest",
  email: "",
  tier: "free",
  tierExpiresAt: null,
  isGuest: true,
};

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  tier: SubscriptionTier;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  upgradeTier: (tier: SubscriptionTier, billing?: "monthly" | "yearly") => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const applyUser = useCallback((next: AuthUser | null) => {
    setUser(next);
    setCachedAuthUser(next);
  }, []);

  const refresh = useCallback(async () => {
    const session = await fetchSession();
    applyUser(session);
    if (session && !session.isGuest && !IS_LOCAL_ONLY) {
      await mergeCloudDataIntoLocal();
    }
  }, [applyUser]);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
    const onChange = () => void refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
  }, [refresh]);

  const startLocalSession = useCallback(
    (next: AuthUser) => {
      writeLocalSession(next);
      applyUser(next);
      notifyAuthChanged();
    },
    [applyUser],
  );

  const login = useCallback(async (email: string, password: string) => {
    if (IS_LOCAL_ONLY) {
      startLocalSession({
        id: `local-${email.trim().toLowerCase()}`,
        email: email.trim(),
        tier: "free",
        tierExpiresAt: null,
        isGuest: false,
      });
      return null;
    }
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return (data.error as string) ?? "Giriş başarısız";
    applyUser(data.user);
    notifyAuthChanged();
    return null;
  }, [applyUser, startLocalSession]);

  const register = useCallback(async (email: string, password: string) => {
    if (IS_LOCAL_ONLY) return login(email, password);
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return (data.error as string) ?? "Kayıt başarısız";
    applyUser(data.user);
    notifyAuthChanged();
    return null;
  }, [applyUser, login]);

  const logout = useCallback(async () => {
    if (IS_LOCAL_ONLY) {
      writeLocalSession(null);
      applyUser(null);
      notifyAuthChanged();
      return;
    }
    await apiFetch("/api/auth/logout", { method: "POST" });
    applyUser(null);
    notifyAuthChanged();
  }, [applyUser]);

  const continueAsGuest = useCallback(async () => {
    if (IS_LOCAL_ONLY) {
      startLocalSession(LOCAL_GUEST);
      return;
    }
    await apiFetch("/api/auth/guest", { method: "POST" });
    await refresh();
    notifyAuthChanged();
  }, [refresh, startLocalSession]);

  const upgradeTier = useCallback(async (tier: SubscriptionTier, billing: "monthly" | "yearly" = "monthly") => {
    const res = await apiFetch("/api/subscription/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, billing }),
    });
    const data = await res.json();
    if (!res.ok) return (data.error as string) ?? "Plan güncellenemedi";
    applyUser(data.user);
    notifyTierChanged();
    notifyAuthChanged();
    return null;
  }, [applyUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      tier: user?.tier ?? "free",
      refresh,
      login,
      register,
      logout,
      continueAsGuest,
      upgradeTier,
    }),
    [user, loading, refresh, login, register, logout, continueAsGuest, upgradeTier],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
