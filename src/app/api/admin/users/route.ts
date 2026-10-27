import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { deleteUser, listUsers, toPublicUser } from "@/lib/auth/store";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await listUsers();
  return NextResponse.json({
    items: users
      .slice()
      .reverse()
      .map((u) => ({
        ...toPublicUser(u),
        createdAt: u.createdAt,
        role: u.role ?? "user",
        suspended: u.suspended ?? false,
      })),
    count: users.length,
  });
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  }

  if (id === session!.user.id) {
    return NextResponse.json({ error: "Kendi hesabını silemezsin" }, { status: 400 });
  }

  const ok = await deleteUser(id);
  if (!ok) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
