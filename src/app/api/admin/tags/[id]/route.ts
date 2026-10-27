import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { appendAuditEntry } from "@/lib/admin/audit";
import { deleteTag, isValidColor, listTags, updateTag } from "@/lib/admin/tags";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    color?: unknown;
    description?: unknown;
    archived?: unknown;
  } | null;

  const patch: { name?: string; color?: string; description?: string; archived?: boolean } = {};

  if (body?.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 40) {
      return NextResponse.json({ error: "Etiket adı 1-40 karakter olmalı" }, { status: 400 });
    }
    const tags = await listTags();
    if (tags.some((t) => t.id !== id && t.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: "Bu isimde bir etiket zaten var" }, { status: 409 });
    }
    patch.name = name;
  }
  if (body?.color !== undefined) {
    if (typeof body.color !== "string" || !isValidColor(body.color)) {
      return NextResponse.json({ error: "Geçersiz renk kodu" }, { status: 400 });
    }
    patch.color = body.color;
  }
  if (body?.description !== undefined) {
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (description.length > 200) {
      return NextResponse.json({ error: "Açıklama en fazla 200 karakter olabilir" }, { status: 400 });
    }
    patch.description = description;
  }
  if (body?.archived !== undefined) {
    patch.archived = body.archived === true;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
  }

  const tag = await updateTag(id, patch);
  if (!tag) {
    return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 });
  }

  await appendAuditEntry({
    actorId: session!.user.id,
    actorEmail: session!.user.email,
    action: patch.archived !== undefined ? (patch.archived ? "tag.archive" : "tag.unarchive") : "tag.update",
    targetType: "tag",
    targetId: id,
    details: { ...(patch.name ? { name: patch.name } : {}) },
  });
  return NextResponse.json({ ok: true, tag });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const ok = await deleteTag(id);
  if (!ok) {
    return NextResponse.json({ error: "Etiket bulunamadı" }, { status: 404 });
  }

  await appendAuditEntry({
    actorId: session!.user.id,
    actorEmail: session!.user.email,
    action: "tag.delete",
    targetType: "tag",
    targetId: id,
  });
  return NextResponse.json({ ok: true });
}
