import { NextResponse } from "next/server";
import { getSessionContext, type SessionContext } from "@/lib/auth/request";

type AdminResult =
  | { session: SessionContext; error: null }
  | { session: null; error: NextResponse };

export async function requireAdmin(): Promise<AdminResult> {
  const session = await getSessionContext();
  if (!session?.isAdmin) {
    return {
      session: null,
      error: NextResponse.json({ error: "Yetkisiz" }, { status: 403 }),
    };
  }
  return { session, error: null };
}
