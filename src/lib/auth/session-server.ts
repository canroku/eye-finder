import { signSession } from "@/lib/auth/crypto";
import { isAdminUser, type StoredUser } from "@/lib/auth/store";
import { resolveEffectiveTier } from "@/lib/auth/tier";

export function buildSessionToken(user: StoredUser): string {
  return signSession({
    userId: user.id,
    email: user.email,
    tier: resolveEffectiveTier(user),
    isAdmin: isAdminUser(user),
  });
}
