import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const DEV_SECRET = "eye-finder-dev-secret-change-me";

// In production the session secret must be configured; never sign with the public dev fallback.
function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production");
  }
  return DEV_SECRET;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derived = scryptSync(password, salt, 64);
    const stored = Buffer.from(hash, "hex");
    if (derived.length !== stored.length) return false;
    return timingSafeEqual(derived, stored);
  } catch {
    return false;
  }
}

export interface SessionPayload {
  userId: string;
  email: string;
  tier: "free" | "plus" | "pro";
  isAdmin?: boolean;
  exp?: number;
}

export function signSession(payload: Omit<SessionPayload, "exp">, days = 30): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + days * 86400,
    }),
  );
  const sig = createHmac("sha256", getSecret()).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const expected = createHmac("sha256", getSecret()).update(`${header}.${body}`).digest("base64url");
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function newUserId(): string {
  return `usr_${randomBytes(12).toString("hex")}`;
}
