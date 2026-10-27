import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { queryAuditEntries } from "@/lib/admin/audit";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = new URL(request.url).searchParams;
  const limit = Number(sp.get("limit") ?? "50");
  const offset = Number(sp.get("offset") ?? "0");

  const result = await queryAuditEntries({
    actor: sp.get("actor") ?? undefined,
    action: sp.get("action") ?? undefined,
    targetId: sp.get("target") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  return NextResponse.json({
    items: result.items,
    total: result.total,
    limit: Math.min(Math.max(Number.isFinite(limit) ? limit : 50, 1), 200),
    offset: Math.max(0, Number.isFinite(offset) ? offset : 0),
  });
}
