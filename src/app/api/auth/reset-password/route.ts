import { NextResponse } from "next/server";
import { findUserByResetToken, updateUserPassword } from "@/lib/auth/store";
import { hashPassword } from "@/lib/auth/crypto";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string; password?: string };
  const token = body.token?.trim();
  const password = body.password?.trim();

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const user = await findUserByResetToken(token);
  if (!user) {
    return NextResponse.json({ error: "Bağlantı geçersiz veya süresi dolmuş" }, { status: 400 });
  }

  const { hash, salt } = hashPassword(password);
  await updateUserPassword(user.id, hash, salt);

  return NextResponse.json({ ok: true, message: "Şifre güncellendi. Giriş yapabilirsin." });
}
