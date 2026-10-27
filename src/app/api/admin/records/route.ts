import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { appendAuditEntry } from "@/lib/admin/audit";
import { changeTagAssignments, readTagStore } from "@/lib/admin/tags";
import { listUserDataRecords } from "@/lib/auth/user-data";
import { listUsers } from "@/lib/auth/store";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const tagFilter = url.searchParams.get("tag") ?? "";
  const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const [records, users, store] = await Promise.all([
    listUserDataRecords(),
    listUsers(),
    readTagStore(),
  ]);
  const emailById = new Map(users.map((u) => [u.id, u.email]));
  const tagById = new Map(store.tags.map((t) => [t.id, t]));

  const items = records
    .map((r) => ({
      id: r.userId,
      ownerId: r.userId,
      ownerEmail: emailById.get(r.userId) ?? null,
      hasProfile: r.profile != null,
      hasResult: r.result != null,
      updatedAt: r.updatedAt,
      tags: (store.assignments[r.userId] ?? [])
        .map((id) => tagById.get(id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    }))
    .filter((r) => !tagFilter || r.tags.some((t) => t.id === tagFilter))
    .filter((r) => !query || (r.ownerEmail ?? "").toLowerCase().includes(query))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return NextResponse.json({ items, count: items.length });
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = (await request.json().catch(() => null)) as {
    recordIds?: unknown;
    tagId?: unknown;
    action?: unknown;
  } | null;

  const recordIds = Array.isArray(body?.recordIds)
    ? body!.recordIds.filter((id): id is string => typeof id === "string")
    : [];
  const tagId = typeof body?.tagId === "string" ? body.tagId : "";
  const action = body?.action === "remove" ? "remove" : body?.action === "add" ? "add" : null;

  if (recordIds.length === 0 || recordIds.length > 500) {
    return NextResponse.json({ error: "1-500 kayıt seçilmeli" }, { status: 400 });
  }
  if (!tagId || !action) {
    return NextResponse.json({ error: "tagId ve action (add|remove) gerekli" }, { status: 400 });
  }

  const result = await changeTagAssignments(recordIds, tagId, action);
  if (result === "tag_not_found") {
    return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 });
  }
  if (result === "tag_archived") {
    return NextResponse.json({ error: "Arşivlenmiş etiket atanamaz" }, { status: 400 });
  }

  await appendAuditEntry({
    actorId: session!.user.id,
    actorEmail: session!.user.email,
    action: action === "add" ? "record.tag_add" : "record.tag_remove",
    targetType: "record",
    targetId: tagId,
    details: { recordCount: recordIds.length, changed: result.changed },
  });
  return NextResponse.json({ ok: true, changed: result.changed });
}
