import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSessionContext } from "@/lib/auth/request";

const SIGNALS_FILE = path.join(process.cwd(), "data", "signals.json");

export async function POST() {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  try {
    await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
    await fs.writeFile(SIGNALS_FILE, "[]\n");
    return NextResponse.json({ ok: true, message: "Sunucu sinyalleri sıfırlandı" });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  try {
    const raw = await fs.readFile(SIGNALS_FILE, "utf-8");
    const signals = JSON.parse(raw) as unknown[];
    return NextResponse.json({ count: signals.length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
