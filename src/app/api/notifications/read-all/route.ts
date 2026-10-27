import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/request";
import { markAllRead } from "@/lib/notifications/store";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const changed = await markAllRead(session.user.id);
  return NextResponse.json({ ok: true, changed });
}
