import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSessionContext } from "@/lib/auth/request";
import { countUserDataFiles } from "@/lib/auth/user-data";

const SIGNALS_FILE = path.join(process.cwd(), "data", "signals.json");

export async function GET() {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  let signals = 0;
  try {
    const raw = await fs.readFile(SIGNALS_FILE, "utf-8");
    signals = (JSON.parse(raw) as unknown[]).length;
  } catch {
    signals = 0;
  }

  const cloudUsers = await countUserDataFiles();
  return NextResponse.json({ signals, cloudUsers });
}
