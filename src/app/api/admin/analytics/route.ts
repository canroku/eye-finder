import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { readAnalytics, writeAnalytics } from "@/lib/admin/data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const events = await readAnalytics();
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    counts[e.name] = (counts[e.name] ?? 0) + 1;
  });

  return NextResponse.json({
    total: events.length,
    counts,
    recent: events.slice(-100).reverse(),
  });
}

export async function DELETE() {
  const { error } = await requireAdmin();
  if (error) return error;

  await writeAnalytics([]);
  return NextResponse.json({ ok: true, message: "Analytics sıfırlandı" });
}
