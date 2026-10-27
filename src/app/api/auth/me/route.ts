import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/crypto";
import { findUserById, toPublicUser } from "@/lib/auth/store";
import { resolveEffectiveTier } from "@/lib/auth/tier";
import { SESSION_COOKIE, GUEST_COOKIE } from "@/lib/auth/constants";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { buildSessionToken } from "@/lib/auth/session-server";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token) {
    const payload = verifySession(token);
    if (payload) {
      const user = await findUserById(payload.userId);
      if (user && !user.suspended) {
        const effectiveTier = resolveEffectiveTier(user);
        const res = NextResponse.json({ user: toPublicUser(user) });
        if (payload.tier !== effectiveTier) {
          res.cookies.set(SESSION_COOKIE, buildSessionToken(user), sessionCookieOptions());
        }
        return res;
      }
    }
  }

  if (jar.get(GUEST_COOKIE)?.value === "1") {
    return NextResponse.json({
      user: {
        id: "guest",
        email: "guest@local",
        tier: "free" as const,
        tierExpiresAt: null,
        isGuest: true,
      },
    });
  }

  return NextResponse.json({ user: null });
}
