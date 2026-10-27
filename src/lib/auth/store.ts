import { promises as fs } from "fs";
import path from "path";
import type { SubscriptionTier } from "@/lib/subscription/tiers";
import { resolveEffectiveTier } from "@/lib/auth/tier";

export type UserRole = "user" | "admin";

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  tier: SubscriptionTier;
  tierExpiresAt: string | null;
  createdAt: string;
  role?: UserRole;
  suspended?: boolean;
  referralCode?: string;
  resetToken?: string | null;
  resetExpiresAt?: string | null;
}

export function isAdminUser(user: Pick<StoredUser, "role">): boolean {
  return user.role === "admin";
}

export function toPublicUser(user: StoredUser) {
  const tier = resolveEffectiveTier(user);
  return {
    id: user.id,
    email: user.email,
    tier,
    tierExpiresAt: user.tierExpiresAt,
    isAdmin: isAdminUser(user),
    isGuest: false as const,
  };
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(user: StoredUser): Promise<StoredUser> {
  const users = await readUsers();
  if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }
  users.push(user);
  await writeUsers(users.slice(-50000));
  return user;
}

export async function updateUserTier(
  id: string,
  tier: SubscriptionTier,
  expiresAt: string | null,
): Promise<StoredUser | null> {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], tier, tierExpiresAt: expiresAt };
  await writeUsers(users);
  return users[idx];
}

export async function updateUserPassword(
  id: string,
  passwordHash: string,
  salt: string,
): Promise<StoredUser | null> {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  users[idx] = {
    ...users[idx],
    passwordHash,
    salt,
    resetToken: null,
    resetExpiresAt: null,
  };
  await writeUsers(users);
  return users[idx];
}

export async function setPasswordResetToken(
  email: string,
  token: string,
  expiresAt: string,
): Promise<StoredUser | null> {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx < 0) return null;
  users[idx] = { ...users[idx], resetToken: token, resetExpiresAt: expiresAt };
  await writeUsers(users);
  return users[idx];
}

export async function findUserByResetToken(token: string): Promise<StoredUser | null> {
  const users = await readUsers();
  const user = users.find((u) => u.resetToken === token) ?? null;
  if (!user?.resetExpiresAt) return null;
  if (new Date(user.resetExpiresAt).getTime() < Date.now()) return null;
  return user;
}

export async function listUsers(): Promise<StoredUser[]> {
  return readUsers();
}

export async function updateUserAdmin(
  id: string,
  patch: Partial<Pick<StoredUser, "tier" | "tierExpiresAt" | "role" | "suspended">>,
): Promise<StoredUser | null> {
  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...patch };
  await writeUsers(users);
  return users[idx];
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await readUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) return false;
  await writeUsers(next);
  return true;
}
