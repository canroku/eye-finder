import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/admin/data";
import type { SubscriptionTier } from "@/lib/subscription/tiers";

export type AnnouncementStatus = "draft" | "published" | "archived";
export type AnnouncementAudience = "all" | "premium" | "free";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  audience: AnnouncementAudience;
  /** ISO time before which the announcement is not visible. Null = immediately. */
  publishAt: string | null;
  /** ISO time after which the announcement is hidden. Null = never. */
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  createdBy: string;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  publishAt: string | null;
  expiresAt: string | null;
}

interface AnnouncementsFile {
  items: Announcement[];
  /** Per-user read state, kept apart from announcements so one row serves all users. */
  reads: Record<string, string[]>;
}

const FILE = "announcements.json";
const MAX_ITEMS = 1000;
const AUDIENCES: AnnouncementAudience[] = ["all", "premium", "free"];

/** Validates the editable fields shared by create and update. */
export function parseAnnouncementInput(
  body: Record<string, unknown> | null,
): { ok: true; value: AnnouncementInput } | { ok: false; error: string } {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  const audience = body?.audience as AnnouncementAudience;
  const publishAt = typeof body?.publishAt === "string" && body.publishAt ? body.publishAt : null;
  const expiresAt = typeof body?.expiresAt === "string" && body.expiresAt ? body.expiresAt : null;

  if (!title || title.length > 120) return { ok: false, error: "Başlık 1-120 karakter olmalı" };
  if (!text || text.length > 2000) return { ok: false, error: "İçerik 1-2000 karakter olmalı" };
  if (!AUDIENCES.includes(audience)) return { ok: false, error: "Geçersiz hedef kitle" };
  if (publishAt && Number.isNaN(Date.parse(publishAt))) {
    return { ok: false, error: "Geçersiz yayın tarihi" };
  }
  if (expiresAt && Number.isNaN(Date.parse(expiresAt))) {
    return { ok: false, error: "Geçersiz bitiş tarihi" };
  }
  if (publishAt && expiresAt && Date.parse(expiresAt) <= Date.parse(publishAt)) {
    return { ok: false, error: "Bitiş tarihi yayın tarihinden sonra olmalı" };
  }
  return { ok: true, value: { title, body: text, audience, publishAt, expiresAt } };
}

async function readFile(): Promise<AnnouncementsFile> {
  return readJsonFile<AnnouncementsFile>(FILE, { items: [], reads: {} });
}

async function writeFile(data: AnnouncementsFile): Promise<void> {
  await writeJsonFile(FILE, data);
}

/** Visible to users only when published, inside its window, and matching the audience. */
export function isLive(a: Announcement, now = Date.now()): boolean {
  if (a.status !== "published") return false;
  if (a.publishAt && Date.parse(a.publishAt) > now) return false;
  if (a.expiresAt && Date.parse(a.expiresAt) <= now) return false;
  return true;
}

export function matchesAudience(a: Announcement, tier: SubscriptionTier): boolean {
  if (a.audience === "all") return true;
  if (a.audience === "premium") return tier !== "free";
  return tier === "free";
}

/** Admin listing: every status, newest first. */
export async function listAnnouncements(): Promise<Announcement[]> {
  const file = await readFile();
  return [...file.items].sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

export async function createAnnouncement(
  input: AnnouncementInput,
  createdBy: string,
): Promise<Announcement> {
  const file = await readFile();
  const now = new Date().toISOString();
  const item: Announcement = {
    id: randomUUID(),
    ...input,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    createdBy,
  };
  file.items.push(item);
  await writeFile({ ...file, items: file.items.slice(-MAX_ITEMS) });
  return item;
}

/** Only drafts can be edited; published or archived content is frozen. */
export async function updateDraft(
  id: string,
  patch: Partial<AnnouncementInput>,
): Promise<Announcement | null> {
  const file = await readFile();
  const item = file.items.find((a) => a.id === id);
  if (!item || item.status !== "draft") return null;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });
  await writeFile(file);
  return item;
}

export async function setStatus(
  id: string,
  status: "published" | "archived",
): Promise<Announcement | null> {
  const file = await readFile();
  const item = file.items.find((a) => a.id === id);
  if (!item || item.status === status) return null;
  const now = new Date().toISOString();
  item.status = status;
  item.updatedAt = now;
  if (status === "published") item.publishedAt = now;
  await writeFile(file);
  return item;
}

/** Announcements a user can see right now, with their read state. */
export async function listForUser(
  userId: string,
  tier: SubscriptionTier,
): Promise<Array<Announcement & { read: boolean }>> {
  const file = await readFile();
  const seen = new Set(file.reads[userId] ?? []);
  const now = Date.now();
  return file.items
    .filter((a) => isLive(a, now) && matchesAudience(a, tier))
    .sort((x, y) => (y.publishAt ?? y.createdAt).localeCompare(x.publishAt ?? x.createdAt))
    .map((a) => ({ ...a, read: seen.has(a.id) }));
}

export async function markAnnouncementRead(userId: string, id: string): Promise<boolean> {
  const file = await readFile();
  const item = file.items.find((a) => a.id === id);
  if (!item || !isLive(item)) return false;
  const list = file.reads[userId] ?? [];
  if (list.includes(id)) return false;
  file.reads[userId] = [...list, id].slice(-MAX_ITEMS);
  await writeFile(file);
  return true;
}
