import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/request";
import {
  getUserPreferences,
  setUserPreferences,
  type NotificationPreferences,
} from "@/lib/notifications/store";

export const dynamic = "force-dynamic";

const KEYS: Array<keyof NotificationPreferences> = [
  "membership",
  "premium_expiry",
  "security",
  "analysis",
  "announcement",
];

export async function GET() {
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const prefs = await getUserPreferences(session.user.id);
  return NextResponse.json(prefs, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request) {
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const patch: Partial<NotificationPreferences> = {};
  for (const key of KEYS) {
    if (body?.[key] === undefined) continue;
    if (typeof body[key] !== "boolean") {
      return NextResponse.json({ error: "Geçersiz tercih değeri" }, { status: 400 });
    }
    patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Güncellenecek tercih yok" }, { status: 400 });
  }

  const prefs = await setUserPreferences(session.user.id, patch);
  return NextResponse.json({ ok: true, preferences: prefs });
}
