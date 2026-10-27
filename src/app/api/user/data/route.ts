import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/request";
import { loadUserData, saveUserData, deleteUserData } from "@/lib/auth/user-data";
import type { PipelineResult, UserProfile } from "@/lib/types";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  const data = await loadUserData(session.user.id);
  return NextResponse.json({
    profile: data?.profile ?? null,
    result: data?.result ?? null,
    updatedAt: data?.updatedAt ?? null,
  });
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  const body = (await request.json()) as {
    profile?: UserProfile | null;
    result?: PipelineResult | null;
  };

  const saved = await saveUserData(session.user.id, {
    profile: body.profile,
    result: body.result,
  });

  return NextResponse.json({ ok: true, updatedAt: saved.updatedAt });
}

export async function DELETE() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  await deleteUserData(session.user.id);
  return NextResponse.json({ ok: true });
}
