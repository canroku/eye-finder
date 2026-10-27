import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { findUserByEmail, setPasswordResetToken } from "@/lib/auth/store";

const RESET_TTL_MS = 60 * 60 * 1000;

function resetBaseUrl(): string | null {
  const configured = process.env.APP_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return process.env.NODE_ENV !== "production" ? "http://localhost:3000" : null;
}

async function sendResetEmail(to: string, link: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[dev] E-posta sağlayıcısı yok. Şifre sıfırlama bağlantısı: ${link}`);
      return true;
    }
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "EyeFinder şifre sıfırlama",
      html: `<p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla. Bağlantı 1 saat geçerlidir.</p><p><a href="${link}">Şifreni sıfırla</a></p><p>Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>`,
    }),
  });

  if (!res.ok) {
    console.error(`[auth] Resend gönderimi başarısız: ${res.status}`);
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email?.includes("@")) {
    return NextResponse.json({ error: "Geçerli e-posta gerekli" }, { status: 400 });
  }

  const baseUrl = resetBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik" }, { status: 503 });
  }

  const message = "Bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.";

  // Hesap var mı yok mu bilgisi sızmasın diye yanıt her durumda aynı.
  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ ok: true, message });
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
  await setPasswordResetToken(email, token, expiresAt);

  const link = `${baseUrl}/reset-password?token=${token}`;
  const sent = await sendResetEmail(email, link);
  if (!sent) {
    return NextResponse.json({ error: "E-posta gönderilemedi, lütfen tekrar dene" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, message });
}
