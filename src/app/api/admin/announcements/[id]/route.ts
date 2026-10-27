import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { appendAuditEntry } from "@/lib/admin/audit";
import {
  parseAnnouncementInput,
  setStatus,
  updateDraft,
} from "@/lib/announcements/store";

export const dynamic = "force-dynamic";

/**
 * PATCH with { action: "publish" | "archive" } changes status.
 * PATCH without an action saves edits to a draft.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const actor = { actorId: session!.user.id, actorEmail: session!.user.email };

  if (body?.action === "publish" || body?.action === "archive") {
    const status = body.action === "publish" ? "published" : "archived";
    const item = await setStatus(id, status);
    if (!item) {
      return NextResponse.json(
        { error: "Duyuru bulunamadı veya durumu değiştirilemez" },
        { status: 409 },
      );
    }
    await appendAuditEntry({
      ...actor,
      action: `announcement.${body.action}`,
      targetType: "announcement",
      targetId: id,
      details: { audience: item.audience, publishAt: item.publishAt, expiresAt: item.expiresAt },
    });
    return NextResponse.json({ ok: true, item });
  }

  const parsed = parseAnnouncementInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const item = await updateDraft(id, parsed.value);
  if (!item) {
    return NextResponse.json(
      { error: "Yalnızca taslak duyurular düzenlenebilir" },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true, item });
}
