import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { readWaitlist, writeWaitlist } from "@/lib/admin/data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const list = await readWaitlist();
  return NextResponse.json({
    items: list.slice().reverse(),
    count: list.length,
  });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "1";
  const email = url.searchParams.get("email")?.toLowerCase();

  if (all) {
    await writeWaitlist([]);
    return NextResponse.json({ ok: true, message: "Waitlist temizlendi" });
  }

  if (!email) {
    return NextResponse.json({ error: "email veya all=1 gerekli" }, { status: 400 });
  }

  const list = await readWaitlist();
  const next = list.filter((e) => e.email.toLowerCase() !== email);
  if (next.length === list.length) {
    return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  }

  await writeWaitlist(next);
  return NextResponse.json({ ok: true });
}
