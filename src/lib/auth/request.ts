import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/crypto";
import { findUserById, isAdminUser, type StoredUser } from "@/lib/auth/store";
import { resolveEffectiveTier } from "@/lib/auth/tier";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import type { SubscriptionTier } from "@/lib/subscription/tiers";

export interface SessionContext {
  user: StoredUser;
  effectiveTier: SubscriptionTier;
  isAdmin: boolean;
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySession(token);
  if (!payload) return null;

  const user = await findUserById(payload.userId);
  if (!user || user.suspended) return null;

  return {
    user,
    effectiveTier: resolveEffectiveTier(user),
    isAdmin: isAdminUser(user),
  };
}
