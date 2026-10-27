import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/request";
import { readAnalytics, writeAnalytics } from "@/lib/admin/data";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name: string; props?: Record<string, string | number | boolean>; ts?: string };
    if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const events = await readAnalytics();
    events.push({ name: body.name, props: body.props, ts: body.ts ?? new Date().toISOString() });
    await writeAnalytics(events.slice(-10000));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

export async function GET() {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const events = await readAnalytics();
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    counts[e.name] = (counts[e.name] ?? 0) + 1;
  });
  return NextResponse.json({ total: events.length, counts });
}
