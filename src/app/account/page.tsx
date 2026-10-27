"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import { TierBadge } from "@/components/plans/TierBadge";
import { getTierPlan } from "@/lib/subscription/tiers";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AccountPage() {
  const { user, tier, logout } = useAuth();
  const plan = getTierPlan(tier);

  if (!user) {
    return (
      <div className="page-stack animate-fade-in pt-2">
        <PageHeader
          title="Hesap"
          subtitle="Oturum açarak planını ve analiz geçmişini yönet."
        />
        <GlassCard>
          <Link href="/welcome" className="btn-primary text-center">
            Giriş yap / Kayıt ol
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-stack animate-fade-in">
      <PageHeader
        label="Profil"
        title="Hesap & abonelik"
        subtitle={
          user.isGuest
            ? "Misafir oturumu"
            : user.isAdmin
              ? `${user.email} — yönetici`
              : user.email
        }
        action={<TierBadge tier={tier} />}
      />

      {user.isAdmin && (
        <p className="-mt-4 text-xs text-accent">Tüm premium özellikler admin hesabında açık.</p>
      )}

      <GlassCard title={plan.name} subtitle="Aktif plan" glow={tier === "pro"}>
        <ul className="mb-5 space-y-2 text-sm text-secondary">
          {plan.features.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-accent">✓</span>
              {f}
            </li>
          ))}
        </ul>
        {user.tierExpiresAt && (
          <p className="mb-4 text-xs text-muted">
            Yenileme: {new Date(user.tierExpiresAt).toLocaleDateString("tr-TR")}
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/plans" className="btn-primary text-center">
            Plan değiştir
          </Link>
          {!user.isGuest ? (
            <button type="button" onClick={() => void logout()} className="btn-secondary">
              Çıkış yap
            </button>
          ) : (
            <Link href="/welcome" className="btn-secondary text-center">
              Hesap oluştur
            </Link>
          )}
        </div>
      </GlassCard>

      {user.isAdmin && (
        <Link href="/admin" className="quick-link border-accent-border">
          <div>
            <p className="text-sm font-medium text-white">Admin paneli</p>
            <p className="text-xs text-muted">Geri bildirim, kullanıcılar, waitlist, analytics</p>
          </div>
          <span className="text-accent">→</span>
        </Link>
      )}

      <Link href="/settings" className="quick-link">
        <div>
          <p className="text-sm font-medium text-white">Uygulama ayarları</p>
          <p className="text-xs text-muted">Tema, veri silme, geri bildirim</p>
        </div>
        <span className="text-secondary">→</span>
      </Link>
    </div>
  );
}
