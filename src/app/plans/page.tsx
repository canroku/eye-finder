"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { PlanComparison } from "@/components/plans/PlanComparison";
import { TierBadge } from "@/components/plans/TierBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import type { SubscriptionTier } from "@/lib/subscription/tiers";

export default function PlansPage() {
  const router = useRouter();
  const { user, tier, upgradeTier, loading } = useAuth();
  const [busy, setBusy] = useState<SubscriptionTier | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const select = async (t: SubscriptionTier) => {
    if (!user || user.isGuest) {
      if (t !== "free") {
        setMsg("Plus ve Pro için önce hesap oluşturmalısın.");
        router.push("/welcome");
        return;
      }
      router.push("/onboarding");
      return;
    }
    setBusy(t);
    setMsg(null);
    const err = await upgradeTier(t);
    setBusy(null);
    if (err) {
      setMsg(err);
      return;
    }
    if (t !== "free") {
      setMsg("Plan güncellendi. Ödeme altyapısı yakında — test erişimi açıldı.");
    }
    router.push("/onboarding");
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="page-stack animate-fade-in">
      <PageHeader
        label="Abonelik"
        title="Planını seç"
        highlight="seç"
        subtitle={
          user?.isGuest
            ? "Misafir modundasın. Free ile devam edebilir veya hesap açabilirsin."
            : user
              ? `${user.email} — aktif plan: ${tier.toUpperCase()}`
              : "İhtiyacına göre Free, Plus veya Pro."
        }
        action={user && !user.isGuest ? <TierBadge tier={tier} /> : undefined}
      />

      {msg && <p className="alert">{msg}</p>}

      <p className="text-xs text-muted lg:hidden">Kaydırarak planları karşılaştır →</p>

      <PlanComparison currentTier={tier} onSelect={select} loadingTier={busy} />

      <button type="button" onClick={() => router.push("/")} className="btn-ghost">
        Ana sayfaya dön
      </button>
    </div>
  );
}
