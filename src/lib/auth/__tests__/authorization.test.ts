import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveEffectiveTier, isTierExpired } from "@/lib/auth/tier";
import { signSession, verifySession } from "@/lib/auth/crypto";
import { verifySessionEdge } from "@/lib/auth/session-edge";
import type { StoredUser } from "@/lib/auth/store";

const FUTURE = new Date(Date.now() + 86_400_000).toISOString();
const PAST = new Date(Date.now() - 86_400_000).toISOString();

function makeUser(overrides: Partial<StoredUser>): StoredUser {
  return {
    id: "usr_test",
    email: "test@example.com",
    passwordHash: "",
    salt: "",
    tier: "free",
    tierExpiresAt: null,
    createdAt: new Date().toISOString(),
    role: "user",
    ...overrides,
  };
}

describe("resolveEffectiveTier", () => {
  it("keeps premium while the expiry is in the future", () => {
    const user = makeUser({ tier: "pro", tierExpiresAt: FUTURE });
    expect(resolveEffectiveTier(user)).toBe("pro");
    expect(isTierExpired(user)).toBe(false);
  });

  it("drops expired premium to free", () => {
    const user = makeUser({ tier: "plus", tierExpiresAt: PAST });
    expect(resolveEffectiveTier(user)).toBe("free");
    expect(isTierExpired(user)).toBe(true);
  });

  it("keeps a paid tier with no expiry date", () => {
    expect(resolveEffectiveTier(makeUser({ tier: "plus", tierExpiresAt: null }))).toBe("plus");
  });

  it("never expires administrators", () => {
    const admin = makeUser({ role: "admin", tier: "pro", tierExpiresAt: PAST });
    expect(resolveEffectiveTier(admin)).toBe("pro");
    expect(isTierExpired(admin)).toBe(false);
  });
});

describe("session signing", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", "test-secret-for-vitest");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("round-trips a session through the Node verifier", () => {
    const token = signSession({ userId: "u1", email: "a@b.c", tier: "plus", isAdmin: false });
    expect(verifySession(token)?.userId).toBe("u1");
  });

  it("rejects a token whose payload was altered to grant admin", () => {
    const token = signSession({ userId: "u1", email: "a@b.c", tier: "free", isAdmin: false });
    const [header, , sig] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ userId: "u1", email: "a@b.c", tier: "pro", isAdmin: true, exp: 9999999999 }),
    ).toString("base64url");
    expect(verifySession(`${header}.${forged}.${sig}`)).toBeNull();
  });

  it("rejects expired sessions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = signSession({ userId: "u1", email: "a@b.c", tier: "free" }, 1);
    vi.setSystemTime(new Date("2026-01-05T00:00:00Z"));
    expect(verifySession(token)).toBeNull();
  });

  it("verifies the same token in the Edge verifier used by middleware", async () => {
    const token = signSession({ userId: "u2", email: "x@y.z", tier: "free", isAdmin: true });
    expect((await verifySessionEdge(token))?.isAdmin).toBe(true);
    expect(await verifySessionEdge(`${token}x`)).toBeNull();
  });

  it("fails closed in production when AUTH_SECRET is missing", async () => {
    // Token signed with the public dev fallback (no AUTH_SECRET, outside production).
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("NODE_ENV", "development");
    const devSigned = signSession({ userId: "u1", email: "a@b.c", tier: "free", isAdmin: true });

    vi.stubEnv("NODE_ENV", "production");
    expect(() => signSession({ userId: "u1", email: "a@b.c", tier: "free" })).toThrow();
    expect(verifySession(devSigned)).toBeNull();
    expect(await verifySessionEdge(devSigned)).toBeNull();
  });
});
