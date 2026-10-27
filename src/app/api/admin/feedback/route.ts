import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { readFeedback, writeFeedback } from "@/lib/admin/data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const list = await readFeedback();
  const avg =
    list.length > 0 ? list.reduce((s, f) => s + f.rating, 0) / list.length : 0;

  return NextResponse.json({
    items: list.slice().reverse(),
    count: list.length,
    average: Math.round(avg * 10) / 10,
  });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "1";
  const indexParam = url.searchParams.get("index");

  if (all) {
    await writeFeedback([]);
    return NextResponse.json({ ok: true, message: "Tüm geri bildirimler silindi" });
  }

  if (indexParam === null) {
    return NextResponse.json({ error: "index veya all=1 gerekli" }, { status: 400 });
  }

  const index = Number(indexParam);
  const list = await readFeedback();
  if (!Number.isInteger(index) || index < 0 || index >= list.length) {
    return NextResponse.json({ error: "Geçersiz index" }, { status: 400 });
  }

  list.splice(index, 1);
  await writeFeedback(list);
  return NextResponse.json({ ok: true });
}
