import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/request";
import { listForUser, markAnnouncementRead } from "@/lib/announcements/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const items = await listForUser(session.user.id, session.effectiveTier);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  if (typeof body?.id !== "string") {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const changed = await markAnnouncementRead(session.user.id, body.id);
  return NextResponse.json({ ok: true, changed });
}
