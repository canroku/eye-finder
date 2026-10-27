import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/admin/data";

export interface AuditEntry {
  id: string;
  ts: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: "user" | "tag" | "record" | "announcement";
  targetId: string;
  /** Only successful operations are written, so every stored entry is "success". */
  outcome?: "success";
  details?: Record<string, string | number | boolean | null>;
}

export interface AuditFilter {
  actor?: string;
  action?: string;
  targetId?: string;
  from?: string;
  to?: string;
  offset?: number;
  limit?: number;
}

const FILE = "admin-audit.json";
const MAX_ENTRIES = 5000;

export async function listAuditEntries(): Promise<AuditEntry[]> {
  return readJsonFile<AuditEntry[]>(FILE, []);
}

/**
 * Newest-first, filtered and paginated view. Only the admin audit route reads
 * this; there is no write or delete path exposed to clients.
 */
export async function queryAuditEntries(
  filter: AuditFilter,
): Promise<{ items: AuditEntry[]; total: number }> {
  const actor = filter.actor?.trim().toLowerCase();
  const action = filter.action?.trim();
  const targetId = filter.targetId?.trim();
  const fromMs = filter.from ? Date.parse(filter.from) : NaN;
  const toMs = filter.to ? Date.parse(filter.to) : NaN;

  const matched = (await listAuditEntries())
    .filter((e) => {
      if (actor && !e.actorEmail.toLowerCase().includes(actor) && e.actorId !== actor) return false;
      if (action && e.action !== action && !e.action.startsWith(`${action}.`)) return false;
      if (targetId && e.targetId !== targetId) return false;
      const ts = Date.parse(e.ts);
      if (Number.isFinite(fromMs) && ts < fromMs) return false;
      if (Number.isFinite(toMs) && ts > toMs) return false;
      return true;
    })
    .reverse();

  const offset = Math.max(0, filter.offset ?? 0);
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  return { items: matched.slice(offset, offset + limit), total: matched.length };
}

export async function appendAuditEntry(
  entry: Omit<AuditEntry, "id" | "ts" | "outcome">,
): Promise<AuditEntry> {
  const list = await listAuditEntries();
  const full: AuditEntry = {
    id: randomUUID(),
    ts: new Date().toISOString(),
    outcome: "success",
    ...entry,
  };
  list.push(full);
  await writeJsonFile(FILE, list.slice(-MAX_ENTRIES));
  return full;
}
