"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiUrl, IS_GITHUB_PAGES, withBasePath } from "@/lib/api";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import Link from "next/link";
import { fullSystemReset, getStorageStats } from "@/lib/storage";
import { getUserErrorMessage } from "@/lib/errors";
import { APP_VERSION } from "@/lib/version";
import { COUNTRY_COUNT } from "@/lib/data/country-matrix";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChangelogPanel } from "@/components/beta/ChangelogPanel";

const RESET_TIMEOUT_MS = 12000;

export default function SettingsPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStorageStats>> | null>(null);
  const [serverSignals, setServerSignals] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [local, res] = await Promise.all([
          getStorageStats(),
          apiFetch("/api/reset")
            .then((r) => {
              if (!r.ok) throw new Error(`API ${r.status}`);
              return r.json();
            })
            .catch(() => ({ count: 0 })),
        ]);
        if (cancelled) return;
        setStats(local);
        setServerSignals(res.count ?? 0);
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setStats({ hasProfile: false, hasResult: false, hasDraft: false, signalCount: 0 });
        setServerSignals(0);
        setLoadError(getUserErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReset = async () => {
    if (!confirm("Tüm profil, sonuç ve öğrenme verileri silinecek. Emin misin?")) return;
    setResetting(true);
    setResetError(null);

    try {
      await Promise.race([
        fullSystemReset(),
        new Promise<void>((resolve) => setTimeout(resolve, RESET_TIMEOUT_MS)),
      ]);
      window.location.replace(withBasePath("/"));
    } catch (err) {
      setResetError(getUserErrorMessage(err));
      setResetting(false);
    }
  };

  return (
      <div className="page-stack pt-2">
        <PageHeader label="Sistem" title="Ayarlar" subtitle="Tema, veri yönetimi ve geri bildirim." />

      {loadError && (
        <ErrorBanner message={loadError} title="Durum yüklenemedi" onDismiss={() => setLoadError(null)} />
      )}

      <GlassCard title="Görünüm" subtitle="Tema">
        <ThemeSwitcher />
      </GlassCard>

      <GlassCard title="Depolama Durumu" subtitle="Yerel cihaz">
        {stats ? (
          <ul className="space-y-2 text-sm text-zinc-400">
            <StatRow label="Profil" ok={stats.hasProfile} />
            <StatRow label="Analiz sonucu" ok={stats.hasResult} />
            <StatRow label="Taslak" ok={stats.hasDraft} />
            <li className="flex justify-between border-t border-zinc-800/60 pt-2">
              <span>Yerel sinyaller</span>
              <span className="font-mono text-accent">{stats.signalCount}</span>
            </li>
            <li className="flex justify-between">
              <span>Sunucu sinyalleri</span>
              <span className="font-mono text-accent">{serverSignals ?? "—"}</span>
            </li>
          </ul>
        ) : (
          <div className="h-20 animate-pulse rounded-xl bg-zinc-800/40" />
        )}
      </GlassCard>

      <GlassCard title="Veri Yönetimi" subtitle="KVKK">
        <p className="mb-4 text-sm text-zinc-400">
          Tüm veriler yalnızca cihazında tutulur. Sıfırlama geri alınamaz.
        </p>
        {resetError && (
          <ErrorBanner message={resetError} title="Sıfırlama başarısız" onDismiss={() => setResetError(null)} />
        )}
        <button
          type="button"
          disabled={resetting}
          onClick={handleReset}
          className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          {resetting ? "Sıfırlanıyor…" : "Sistemi Tamamen Sıfırla"}
        </button>
      </GlassCard>

      <GlassCard title="Geri Bildirim" subtitle="Faz 3">
        <FeedbackForm />
      </GlassCard>

      <GlassCard title="Hesap & Plan" subtitle="Abonelik">
        <div className="flex flex-col gap-2">
          <Link href="/account" className="btn-primary text-center text-sm">
            Hesabım & Abonelik
          </Link>
          <Link href="/plans" className="btn-secondary text-center text-sm">
            Planları karşılaştır
          </Link>
        </div>
      </GlassCard>

      <GlassCard title="KVKK" subtitle="Faz 4">
        <p className="mb-3 text-sm text-zinc-400">
          Veri hakların ve saklama politikası API üzerinden erişilebilir.
        </p>
        <Link href="/privacy" className="text-sm text-accent hover:underline">
          Gizlilik & KVKK metni →
        </Link>
        {!IS_GITHUB_PAGES && (
        <a
          href={apiUrl("/api/kvkk")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-xs text-zinc-500 hover:text-accent"
        >
          API JSON →
        </a>
        )}
      </GlassCard>

      <GlassCard title="Beta" subtitle={`v${APP_VERSION}`}>
        <Link href="/beta" className="btn-primary mb-4 block text-center text-sm">
          Beta Sayfası & Waitlist
        </Link>
        <ChangelogPanel />
      </GlassCard>

      <GlassCard title="Hakkında" subtitle={`Eye Finder v${APP_VERSION}`}>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li>• {COUNTRY_COUNT} ülke kültürel uyum matrisi</li>
          <li>• Min 1 fotoğraf — çok foto = derin analiz</li>
          <li>• 68 landmark yüz AI (simetri, poz, ifade)</li>
          <li>• 80 soruluk derin kişilik testi</li>
          <li>• Global öğrenme motoru (100+ sinyal)</li>
          <li>• 3 renk teması · Demo · Paylaşım kartı</li>
        </ul>
        <p className="mt-4 text-xs text-zinc-600">
          Eşleştirme uygulaması değildir — küresel ilgi potansiyeli analizidir.
        </p>
      </GlassCard>
    </div>
  );
}

function StatRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex justify-between">
      <span>{label}</span>
      <span className={ok ? "text-emerald-400" : "text-zinc-600"}>
        {ok ? "Var" : "Yok"}
      </span>
    </li>
  );
}
