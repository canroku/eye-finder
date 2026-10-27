"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { createDemoProfile } from "@/lib/demo-profile";
import { runPipelineSafe } from "@/lib/pipeline/runner";
import { saveProfile, saveResult } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { getUserErrorMessage } from "@/lib/errors";
import { GlassCard } from "@/components/ui/GlassCard";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { COUNTRY_COUNT } from "@/lib/data/country-matrix";

export default function DemoPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const launch = async () => {
    setLoading(true);
    setError(null);
    trackEvent("demo_launch");
    try {
      const profile = createDemoProfile();
      const result = await runPipelineSafe(profile, { timeoutMs: 60_000 });
      if (result.eyeScore.missingSteps.length > 0) {
        throw new Error(`Eksik adımlar: ${result.eyeScore.missingSteps.join(", ")}`);
      }
      await saveResult(result);
      await saveProfile(profile);
      window.location.replace("/results");
    } catch (err) {
      setError(getUserErrorMessage(err));
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-dim border-t-accent" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="page-stack pt-4">
        <PageHeader
          title="Yetkisiz"
          subtitle="Demo modu yalnızca admin hesaplarına açıktır. Giriş yapın veya admin panelinden erişin."
        />
        <div className="flex flex-col gap-2">
          <Link href="/welcome" className="btn-primary text-center">
            Giriş yap
          </Link>
          <Link href="/" className="btn-secondary text-center">
            Ana sayfa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 pb-8 pt-4">
      <div>
        <p className="section-label">Admin · Önizleme</p>
        <h1 className="text-xl font-bold text-white">Demo Modu</h1>
        <p className="mt-1 text-xs text-zinc-500">Yalnızca yöneticiler</p>
      </div>
      <GlassCard title="Hızlı Keşif" subtitle="Örnek profil analizi">
        <p className="mb-4 text-sm text-zinc-400">
          Örnek profil ile algoritmayı dene — {COUNTRY_COUNT} ülke uyumu, Eye Score ve insights.
          Gerçek fotoğraf yüklemeden sonuç ekranını gör.
        </p>
        {error && (
          <ErrorBanner message={error} onRetry={launch} onDismiss={() => setError(null)} />
        )}
        <button
          type="button"
          disabled={loading}
          onClick={launch}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? "Demo çalışıyor…" : "Demo Analizi Başlat"}
        </button>
        <Link href="/admin" className="btn-ghost mt-3 block text-center text-sm">
          Admin paneline dön
        </Link>
      </GlassCard>
    </div>
  );
}
