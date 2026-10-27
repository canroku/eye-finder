import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "country-feedback.json");

interface CountryFeedback {
  countryCode: string;
  countryName: string;
  affinity: number;
  vote: "yes" | "partial" | "no";
  ts: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CountryFeedback;
    if (!body.countryCode || !body.vote) {
      return NextResponse.json({ error: "countryCode ve vote gerekli" }, { status: 400 });
    }
    const list: CountryFeedback[] = JSON.parse(await fs.readFile(FILE, "utf-8").catch(() => "[]"));
    list.push({
      countryCode: body.countryCode,
      countryName: body.countryName ?? body.countryCode,
      affinity: body.affinity ?? 0,
      vote: body.vote,
      ts: body.ts ?? new Date().toISOString(),
    });
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(list.slice(-5000), null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

export async function GET() {
  const list: CountryFeedback[] = JSON.parse(await fs.readFile(FILE, "utf-8").catch(() => "[]"));
  const summary = { yes: 0, partial: 0, no: 0 };
  list.forEach((f) => {
    summary[f.vote] += 1;
  });
  return NextResponse.json({ count: list.length, summary });
}
