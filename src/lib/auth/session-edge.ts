const DEV_SECRET = "eye-finder-dev-secret-change-me";

// In production the session secret must be configured; never verify with the public dev fallback.
function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production");
  }
  return DEV_SECRET;
}

interface SessionPayload {
  userId: string;
  email: string;
  tier: "free" | "plus" | "pro";
  isAdmin?: boolean;
  exp?: number;
}

function b64urlFromBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function verifySessionEdge(token: string): Promise<SessionPayload | null> {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const data = new TextEncoder().encode(`${header}.${body}`);
    const expectedBuf = await crypto.subtle.sign("HMAC", key, data);
    const expected = b64urlFromBuffer(expectedBuf);
    if (sig !== expected) return null;

    const json = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAdminSession(payload: SessionPayload | null): boolean {
  return payload?.isAdmin === true;
}
