import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { appendAuditEntry } from "@/lib/admin/audit";
import { createNotification } from "@/lib/notifications/store";
import {
  findUserById,
  listUsers,
  updateUserAdmin,
  toPublicUser,
  isAdminUser,
} from "@/lib/auth/store";
import type { SubscriptionTier } from "@/lib/subscription/tiers";
import type { UserRole } from "@/lib/auth/store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = (await request.json()) as {
    tier?: SubscriptionTier;
    role?: UserRole;
    tierExpiresAt?: string | null;
    suspended?: boolean;
  };

  const target = await findUserById(id);
  if (!target) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const isSelf = id === session!.user.id;
  const patch: Partial<{
    tier: SubscriptionTier;
    role: UserRole;
    tierExpiresAt: string | null;
    suspended: boolean;
  }> = {};

  if (body.tier !== undefined) {
    if (!["free", "plus", "pro"].includes(body.tier)) {
      return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
    }
    patch.tier = body.tier;
  }

  if (body.role !== undefined) {
    if (!["user", "admin"].includes(body.role)) {
      return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
    }
    if (isSelf && body.role !== "admin") {
      return NextResponse.json({ error: "Kendi admin rolünü kaldıramazsın" }, { status: 400 });
    }
    patch.role = body.role;
  }

  if (body.suspended !== undefined) {
    if (isSelf && body.suspended) {
      return NextResponse.json({ error: "Kendi hesabını askıya alamazsın" }, { status: 400 });
    }
    patch.suspended = body.suspended;
  }

  if (body.tierExpiresAt !== undefined) {
    patch.tierExpiresAt = body.tierExpiresAt;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
  }

  // Son aktif admin koruması: admin yetkisini kaldıran ya da askıya alan
  // işlem, sistemde başka aktif admin bırakmıyorsa reddedilir.
  const losesAdmin =
    isAdminUser(target) &&
    ((patch.role !== undefined && patch.role !== "admin") || patch.suspended === true);
  if (losesAdmin) {
    const users = await listUsers();
    const otherActiveAdmins = users.filter(
      (u) => u.id !== id && isAdminUser(u) && !u.suspended,
    );
    if (otherActiveAdmins.length === 0) {
      return NextResponse.json(
        { error: "Sistemde en az bir aktif admin bulunmalı" },
        { status: 400 },
      );
    }
  }

  const updated = await updateUserAdmin(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  // Audit only what actually changed, and only after the write succeeded.
  const actor = { actorId: session!.user.id, actorEmail: session!.user.email };

  if (patch.role !== undefined && patch.role !== target.role) {
    await appendAuditEntry({
      ...actor,
      action: "user.role_change",
      targetType: "user",
      targetId: id,
      details: { from: target.role ?? "user", to: patch.role },
    });
  }

  if (patch.suspended !== undefined && patch.suspended !== (target.suspended ?? false)) {
    await appendAuditEntry({
      ...actor,
      action: patch.suspended ? "user.suspend" : "user.reactivate",
      targetType: "user",
      targetId: id,
    });
    await createNotification({
      userId: id,
      kind: "security",
      title: patch.suspended ? "Hesabın askıya alındı" : "Hesabın yeniden etkinleştirildi",
      body: patch.suspended
        ? "Hesabın yönetici tarafından askıya alındı. Destek için yönetici ile iletişime geç."
        : "Hesabın yönetici tarafından yeniden etkinleştirildi.",
    });
  }

  const tierChanged = patch.tier !== undefined && patch.tier !== target.tier;
  const expiryChanged =
    patch.tierExpiresAt !== undefined && patch.tierExpiresAt !== target.tierExpiresAt;
  if (tierChanged || expiryChanged) {
    const grantsPremium = updated.tier !== "free";
    await appendAuditEntry({
      ...actor,
      action: grantsPremium ? "premium.grant" : "premium.revoke",
      targetType: "user",
      targetId: id,
      details: {
        from: target.tier,
        to: updated.tier,
        tierExpiresAt: updated.tierExpiresAt,
      },
    });
    await createNotification({
      userId: id,
      kind: "membership",
      title: grantsPremium ? "Üyelik planın güncellendi" : "Üyelik planın değişti",
      body: grantsPremium
        ? `Planın ${updated.tier} olarak güncellendi${updated.tierExpiresAt ? `; bitiş: ${updated.tierExpiresAt}` : ""}.`
        : "Premium erişimin yönetici tarafından kaldırıldı.",
    });
  }

  return NextResponse.json({
    ok: true,
    user: {
      ...toPublicUser(updated),
      createdAt: updated.createdAt,
      role: updated.role ?? "user",
      suspended: updated.suspended ?? false,
    },
  });
}
