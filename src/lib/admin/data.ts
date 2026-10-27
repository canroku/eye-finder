import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf8");
}

export interface FeedbackEntry {
  rating: number;
  comment?: string;
  ts: string;
}

export interface CountryFeedbackEntry {
  countryCode: string;
  countryName: string;
  affinity: number;
  vote: "yes" | "partial" | "no";
  ts: string;
}

export interface WaitlistEntry {
  email: string;
  referralCode?: string;
  ts: string;
}

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
  ts: string;
}

export async function readFeedback(): Promise<FeedbackEntry[]> {
  return readJsonFile<FeedbackEntry[]>("feedback.json", []);
}

export async function writeFeedback(list: FeedbackEntry[]): Promise<void> {
  await writeJsonFile("feedback.json", list);
}

export async function readCountryFeedback(): Promise<CountryFeedbackEntry[]> {
  return readJsonFile<CountryFeedbackEntry[]>("country-feedback.json", []);
}

export async function writeCountryFeedback(list: CountryFeedbackEntry[]): Promise<void> {
  await writeJsonFile("country-feedback.json", list);
}

export async function readWaitlist(): Promise<WaitlistEntry[]> {
  return readJsonFile<WaitlistEntry[]>("waitlist.json", []);
}

export async function writeWaitlist(list: WaitlistEntry[]): Promise<void> {
  await writeJsonFile("waitlist.json", list);
}

export async function readAnalytics(): Promise<AnalyticsEvent[]> {
  return readJsonFile<AnalyticsEvent[]>("analytics.json", []);
}

export async function writeAnalytics(events: AnalyticsEvent[]): Promise<void> {
  await writeJsonFile("analytics.json", events);
}

export async function readSignalsCount(): Promise<number> {
  const list = await readJsonFile<unknown[]>("signals.json", []);
  return list.length;
}
