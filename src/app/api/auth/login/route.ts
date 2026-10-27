import { NextResponse } from "next/server";
import { findUserByEmail, toPublicUser } from "@/lib/auth/store";
import { verifyPassword } from "@/lib/auth/crypto";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { buildSessionToken } from "@/lib/auth/session-server";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: "E-posta ve şifre gerekli" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
  }

  if (user.suspended) {
    return NextResponse.json({ error: "Hesap askıya alındı" }, { status: 403 });
  }

  const token = buildSessionToken(user);
  const res = NextResponse.json({
    ok: true,
    user: toPublicUser(user),
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  res.cookies.delete("ef_guest_ok");
  return res;
}
