import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/request";
import { readWaitlist, writeWaitlist, type WaitlistEntry } from "@/lib/admin/data";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WaitlistEntry;
    if (!body.email?.includes("@")) {
      return NextResponse.json({ error: "Geçerli e-posta gerekli" }, { status: 400 });
    }
    const list = await readWaitlist();
    if (list.some((e) => e.email.toLowerCase() === body.email.toLowerCase())) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    list.push({
      email: body.email.toLowerCase().slice(0, 120),
      referralCode: body.referralCode?.slice(0, 32),
      ts: body.ts ?? new Date().toISOString(),
    });
    await writeWaitlist(list.slice(-10000));
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

  const list = await readWaitlist();
  return NextResponse.json({ count: list.length });
}
