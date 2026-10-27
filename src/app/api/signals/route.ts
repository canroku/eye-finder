import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SIGNALS_FILE = path.join(DATA_DIR, "signals.json");

interface StoredSignal {
  region: string;
  likedTraits: string[];
  timestamp: string;
  topCountry?: string;
}

async function readSignals(): Promise<StoredSignal[]> {
  try {
    const raw = await fs.readFile(SIGNALS_FILE, "utf-8");
    return JSON.parse(raw) as StoredSignal[];
  } catch {
    return [];
  }
}

async function writeSignals(signals: StoredSignal[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SIGNALS_FILE, JSON.stringify(signals.slice(-5000), null, 2));
}

export async function POST(request: Request) {
  try {
    const signal = (await request.json()) as StoredSignal;
    if (!signal.region || !Array.isArray(signal.likedTraits)) {
      return NextResponse.json({ error: "Invalid signal" }, { status: 400 });
    }
    const signals = await readSignals();
    signals.push({ ...signal, timestamp: signal.timestamp ?? new Date().toISOString() });
    await writeSignals(signals);
    return NextResponse.json({ ok: true, count: signals.length });
  } catch {
    return NextResponse.json({ ok: false, offline: true }, { status: 503 });
  }
}

export async function GET() {
  try {
    const signals = await readSignals();
    return NextResponse.json({ count: signals.length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
