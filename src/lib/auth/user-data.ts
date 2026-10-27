import { promises as fs } from "fs";
import path from "path";
import type { PipelineResult, UserProfile } from "@/lib/types";

export interface UserCloudData {
  userId: string;
  profile: UserProfile | null;
  result: PipelineResult | null;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data", "user-data");

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function fileFor(userId: string): string {
  return path.join(DATA_DIR, `${userId}.json`);
}

export async function loadUserData(userId: string): Promise<UserCloudData | null> {
  await ensureDir();
  try {
    const raw = await fs.readFile(fileFor(userId), "utf8");
    return JSON.parse(raw) as UserCloudData;
  } catch {
    return null;
  }
}

export async function saveUserData(
  userId: string,
  patch: { profile?: UserProfile | null; result?: PipelineResult | null },
): Promise<UserCloudData> {
  await ensureDir();
  const existing = (await loadUserData(userId)) ?? {
    userId,
    profile: null,
    result: null,
    updatedAt: new Date().toISOString(),
  };
  const next: UserCloudData = {
    ...existing,
    profile: patch.profile !== undefined ? patch.profile : existing.profile,
    result: patch.result !== undefined ? patch.result : existing.result,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(fileFor(userId), JSON.stringify(next), "utf8");
  return next;
}

export async function deleteUserData(userId: string): Promise<void> {
  try {
    await fs.unlink(fileFor(userId));
  } catch {
    /* yok */
  }
}

export async function listUserDataRecords(): Promise<UserCloudData[]> {
  await ensureDir();
  let files: string[] = [];
  try {
    files = (await fs.readdir(DATA_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const records: UserCloudData[] = [];
  for (const file of files) {
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
      records.push(JSON.parse(raw) as UserCloudData);
    } catch {
      /* bozuk dosyayı atla */
    }
  }
  return records;
}

export async function countUserDataFiles(): Promise<number> {
  await ensureDir();
  try {
    const files = await fs.readdir(DATA_DIR);
    return files.filter((f) => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}
