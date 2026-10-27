import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "feedback.json");

interface Feedback {
  rating: number;
  comment?: string;
  ts: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Feedback;
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "rating 1-5 required" }, { status: 400 });
    }
    const list: Feedback[] = JSON.parse(
      await fs.readFile(FILE, "utf-8").catch(() => "[]"),
    );
    list.push({
      rating: body.rating,
      comment: body.comment?.slice(0, 2000),
      ts: body.ts ?? new Date().toISOString(),
    });
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(list.slice(-2000), null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

export async function GET() {
  const list: Feedback[] = JSON.parse(await fs.readFile(FILE, "utf-8").catch(() => "[]"));
  const avg =
    list.length > 0 ? list.reduce((s, f) => s + f.rating, 0) / list.length : 0;
  return NextResponse.json({ count: list.length, average: Math.round(avg * 10) / 10 });
}
