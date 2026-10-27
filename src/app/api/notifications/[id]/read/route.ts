import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/request";
import { markRead } from "@/lib/notifications/store";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const { id } = await params;
  // Ownership is enforced inside the store: another user's id simply matches nothing.
  const changed = await markRead(session.user.id, id);
  return NextResponse.json({ ok: true, changed }, { headers: { "Cache-Control": "private, no-store" } });
}
