import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  createAnnouncement,
  listAnnouncements,
  parseAnnouncementInput,
} from "@/lib/announcements/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const items = await listAnnouncements();
  return NextResponse.json({ items }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = parseAnnouncementInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const item = await createAnnouncement(parsed.value, session!.user.id);
  return NextResponse.json({ ok: true, item }, { status: 201 });
}
