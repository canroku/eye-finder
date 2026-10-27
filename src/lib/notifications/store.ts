import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/admin/data";

export type NotificationKind =
  | "membership"
  | "premium_expiry"
  | "security"
  | "analysis"
  | "announcement";

export interface Notification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  /** Only set for announcement-derived notifications; prevents duplicates. */
  announcementId?: string;
}

export interface NotificationPreferences {
  membership: boolean;
  premium_expiry: boolean;
  security: boolean;
  analysis: boolean;
  announcement: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  membership: true,
  premium_expiry: true,
  security: true,
  analysis: true,
  announcement: true,
};

interface NotificationsFile {
  items: Notification[];
  preferences: Record<string, NotificationPreferences>;
}

const FILE = "notifications.json";
const MAX_PER_USER = 500;

async function readFile(): Promise<NotificationsFile> {
  return readJsonFile<NotificationsFile>(FILE, { items: [], preferences: {} });
}

async function writeFile(data: NotificationsFile): Promise<void> {
  await writeJsonFile(FILE, data);
}

export function getPreferences(file: NotificationsFile, userId: string): NotificationPreferences {
  return { ...DEFAULT_PREFERENCES, ...(file.preferences[userId] ?? {}) };
}

/**
 * Creates a notification for one user. Skipped when the user disabled that kind.
 * Callers are server-side event hooks only; there is no client write path.
 */
export async function createNotification(input: {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  announcementId?: string;
}): Promise<Notification | null> {
  const file = await readFile();
  if (!getPreferences(file, input.userId)[input.kind]) return null;

  const item: Notification = {
    id: randomUUID(),
    userId: input.userId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    createdAt: new Date().toISOString(),
    readAt: null,
    ...(input.announcementId ? { announcementId: input.announcementId } : {}),
  };

  file.items.push(item);
  // Keep the per-user history bounded.
  const userItems = file.items.filter((n) => n.userId === input.userId);
  if (userItems.length > MAX_PER_USER) {
    const drop = new Set(userItems.slice(0, userItems.length - MAX_PER_USER).map((n) => n.id));
    file.items = file.items.filter((n) => !drop.has(n.id));
  }
  await writeFile(file);
  return item;
}

export interface NotificationPage {
  items: Notification[];
  total: number;
  unread: number;
  offset: number;
  limit: number;
}

/** Only ever returns rows owned by `userId`. */
export async function listNotifications(
  userId: string,
  opts: { offset?: number; limit?: number; unreadOnly?: boolean },
): Promise<NotificationPage> {
  const file = await readFile();
  const own = file.items
    .filter((n) => n.userId === userId)
    .reverse();
  const filtered = opts.unreadOnly ? own.filter((n) => n.readAt === null) : own;
  const offset = Math.max(0, opts.offset ?? 0);
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    unread: own.filter((n) => n.readAt === null).length,
    offset,
    limit,
  };
}

export async function countUnread(userId: string): Promise<number> {
  const file = await readFile();
  return file.items.filter((n) => n.userId === userId && n.readAt === null).length;
}

/** Returns true only if a row owned by `userId` was changed from unread to read. */
export async function markRead(userId: string, id: string): Promise<boolean> {
  const file = await readFile();
  const item = file.items.find((n) => n.id === id && n.userId === userId);
  if (!item || item.readAt !== null) return false;
  item.readAt = new Date().toISOString();
  await writeFile(file);
  return true;
}

export async function markAllRead(userId: string): Promise<number> {
  const file = await readFile();
  const now = new Date().toISOString();
  let changed = 0;
  for (const item of file.items) {
    if (item.userId === userId && item.readAt === null) {
      item.readAt = now;
      changed++;
    }
  }
  if (changed > 0) await writeFile(file);
  return changed;
}

export async function getUserPreferences(userId: string): Promise<NotificationPreferences> {
  return getPreferences(await readFile(), userId);
}

export async function setUserPreferences(
  userId: string,
  patch: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const file = await readFile();
  const next = { ...getPreferences(file, userId), ...patch };
  file.preferences[userId] = next;
  await writeFile(file);
  return next;
}
