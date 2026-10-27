import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { readCountryFeedback, writeCountryFeedback } from "@/lib/admin/data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const list = await readCountryFeedback();
  const summary = { yes: 0, partial: 0, no: 0 };
  list.forEach((f) => {
    summary[f.vote] += 1;
  });

  return NextResponse.json({
    items: list.slice().reverse(),
    count: list.length,
    summary,
  });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "1";
  const indexParam = url.searchParams.get("index");

  if (all) {
    await writeCountryFeedback([]);
    return NextResponse.json({ ok: true, message: "Tüm ülke oyları silindi" });
  }

  if (indexParam === null) {
    return NextResponse.json({ error: "index veya all=1 gerekli" }, { status: 400 });
  }

  const index = Number(indexParam);
  const list = await readCountryFeedback();
  if (!Number.isInteger(index) || index < 0 || index >= list.length) {
    return NextResponse.json({ error: "Geçersiz index" }, { status: 400 });
  }

  list.splice(index, 1);
  await writeCountryFeedback(list);
  return NextResponse.json({ ok: true });
}
