import { NextResponse } from "next/server";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/auth/store";
import { hashPassword, newUserId } from "@/lib/auth/crypto";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { buildSessionToken } from "@/lib/auth/session-server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    name?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email?.includes("@")) {
    return NextResponse.json({ error: "Geçerli e-posta gerekli" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
  }

  const { hash, salt } = hashPassword(password);
  const user = await createUser({
    id: newUserId(),
    email,
    passwordHash: hash,
    salt,
    tier: "free",
    tierExpiresAt: null,
    createdAt: new Date().toISOString(),
  });

  const token = buildSessionToken(user);
  const res = NextResponse.json({
    ok: true,
    user: toPublicUser(user),
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  res.cookies.delete("ef_guest_ok");
  return res;
}
