import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { appendAuditEntry } from "@/lib/admin/audit";
import { createTag, isValidColor, listTags, readTagStore, countRecordsPerTag } from "@/lib/admin/tags";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const store = await readTagStore();
  const counts = countRecordsPerTag(store);
  return NextResponse.json({
    items: store.tags.map((t) => ({ ...t, recordCount: counts[t.id] ?? 0 })),
  });
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    color?: unknown;
    description?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const color = typeof body?.color === "string" ? body.color : "#6366f1";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!name || name.length > 40) {
    return NextResponse.json({ error: "Etiket adı 1-40 karakter olmalı" }, { status: 400 });
  }
  if (!isValidColor(color)) {
    return NextResponse.json({ error: "Geçersiz renk kodu" }, { status: 400 });
  }
  if (description.length > 200) {
    return NextResponse.json({ error: "Açıklama en fazla 200 karakter olabilir" }, { status: 400 });
  }

  const existing = await listTags();
  if (existing.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
    return NextResponse.json({ error: "Bu isimde bir etiket zaten var" }, { status: 409 });
  }

  const tag = await createTag({ name, color, description });
  await appendAuditEntry({
    actorId: session!.user.id,
    actorEmail: session!.user.email,
    action: "tag.create",
    targetType: "tag",
    targetId: tag.id,
    details: { name },
  });
  return NextResponse.json({ ok: true, tag }, { status: 201 });
}
