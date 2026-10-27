import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/request";
import { listNotifications } from "@/lib/notifications/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const sp = new URL(request.url).searchParams;
  const page = await listNotifications(session.user.id, {
    offset: Number(sp.get("offset") ?? "0"),
    limit: Number(sp.get("limit") ?? "20"),
    unreadOnly: sp.get("unread") === "1",
  });

  return NextResponse.json(page, { headers: { "Cache-Control": "private, no-store" } });
}
