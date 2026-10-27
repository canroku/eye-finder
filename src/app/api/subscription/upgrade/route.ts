import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/crypto";
import { findUserById, isAdminUser, toPublicUser, updateUserTier } from "@/lib/auth/store";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { buildSessionToken } from "@/lib/auth/session-server";
import type { SubscriptionTier } from "@/lib/subscription/tiers";

export async function POST(request: Request) {
  const body = (await request.json()) as { tier?: SubscriptionTier; billing?: string };
  const tier = body.tier;

  if (!tier || !["free", "plus", "pro"].includes(tier)) {
    return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  const payload = verifySession(token);
  if (!payload) {
    return NextResponse.json({ error: "Oturum süresi doldu" }, { status: 401 });
  }

  // Ödeme entegrasyonu henüz yok: ücretli planı kullanıcının kendisi açamaz.
  // Yalnızca admin (her ortamda) ücretli plan atayabilir; yetki token'a değil
  // sunucudaki kayda bakılarak doğrulanır.
  if (tier !== "free") {
    const caller = await findUserById(payload.userId);
    if (!caller || !isAdminUser(caller)) {
      return NextResponse.json(
        { error: "Ücretli planlar henüz aktif değil. Ödeme altyapısı tamamlanınca açılacak." },
        { status: 402 },
      );
    }
  }

  const expiresAt =
    tier === "free"
      ? null
      : new Date(Date.now() + (body.billing === "yearly" ? 365 : 30) * 86400000).toISOString();

  const user = await updateUserTier(payload.userId, tier, expiresAt);
  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const newToken = buildSessionToken(user);
  const res = NextResponse.json({
    ok: true,
    user: toPublicUser(user),
    payment: tier === "free" ? null : { status: "stub", message: "Ödeme entegrasyonu Faz 7-8'de aktif olacak" },
  });
  res.cookies.set(SESSION_COOKIE, newToken, sessionCookieOptions());
  return res;
}
