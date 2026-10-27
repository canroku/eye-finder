import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/admin/data";

export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
  archived: boolean;
  createdAt: string;
}

export interface TagStore {
  tags: Tag[];
  /** recordId (owner user id) -> tag ids */
  assignments: Record<string, string[]>;
}

const FILE = "tags.json";
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isValidColor(color: string): boolean {
  return HEX_COLOR.test(color);
}

export async function readTagStore(): Promise<TagStore> {
  return readJsonFile<TagStore>(FILE, { tags: [], assignments: {} });
}

async function writeTagStore(store: TagStore): Promise<void> {
  await writeJsonFile(FILE, store);
}

export async function listTags(): Promise<Tag[]> {
  return (await readTagStore()).tags;
}

export async function createTag(input: {
  name: string;
  color: string;
  description: string;
}): Promise<Tag> {
  const store = await readTagStore();
  const tag: Tag = {
    id: randomUUID(),
    name: input.name,
    color: input.color,
    description: input.description,
    archived: false,
    createdAt: new Date().toISOString(),
  };
  store.tags.push(tag);
  await writeTagStore(store);
  return tag;
}

export async function updateTag(
  id: string,
  patch: Partial<Pick<Tag, "name" | "color" | "description" | "archived">>,
): Promise<Tag | null> {
  const store = await readTagStore();
  const idx = store.tags.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  store.tags[idx] = { ...store.tags[idx], ...patch };
  await writeTagStore(store);
  return store.tags[idx];
}

/** Removes the tag and its assignments. Records themselves are never touched. */
export async function deleteTag(id: string): Promise<boolean> {
  const store = await readTagStore();
  const next = store.tags.filter((t) => t.id !== id);
  if (next.length === store.tags.length) return false;
  const assignments: Record<string, string[]> = {};
  for (const [recordId, tagIds] of Object.entries(store.assignments)) {
    const kept = tagIds.filter((t) => t !== id);
    if (kept.length > 0) assignments[recordId] = kept;
  }
  await writeTagStore({ tags: next, assignments });
  return true;
}

/**
 * Adds or removes a tag on many records at once. Only active (non-archived)
 * tags can be newly assigned; removal always works.
 */
export async function changeTagAssignments(
  recordIds: string[],
  tagId: string,
  action: "add" | "remove",
): Promise<{ changed: number } | "tag_not_found" | "tag_archived"> {
  const store = await readTagStore();
  const tag = store.tags.find((t) => t.id === tagId);
  if (!tag) return "tag_not_found";
  if (action === "add" && tag.archived) return "tag_archived";

  let changed = 0;
  for (const recordId of recordIds) {
    const current = store.assignments[recordId] ?? [];
    if (action === "add") {
      if (!current.includes(tagId)) {
        store.assignments[recordId] = [...current, tagId];
        changed++;
      }
    } else if (current.includes(tagId)) {
      const kept = current.filter((t) => t !== tagId);
      if (kept.length > 0) store.assignments[recordId] = kept;
      else delete store.assignments[recordId];
      changed++;
    }
  }
  await writeTagStore(store);
  return { changed };
}

export function countRecordsPerTag(store: TagStore): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tagIds of Object.values(store.assignments)) {
    for (const id of tagIds) counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
