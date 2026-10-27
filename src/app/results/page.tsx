"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PipelineResult } from "@/lib/types";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { fullSystemReset, loadResult } from "@/lib/storage";
import { getUserErrorMessage } from "@/lib/errors";
import { completeDailyMission } from "@/lib/engagement/store";

export default function ResultsPage() {
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadResult()
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult(null);
          setError(getUserErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    completeDailyMission("open_results");

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-dim border-t-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in space-y-4 pt-4">
        <ErrorBanner
          message={error}
          title="Sonuçlar yüklenemedi"
          onRetry={() => window.location.reload()}
        />
        <Link href="/onboarding" className="btn-primary block text-center">
          Yeni Analiz Başlat
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-zinc-400">Henüz analiz sonucun yok.</p>
        <Link href="/onboarding" className="btn-primary">
          Profil Oluştur
        </Link>
      </div>
    );
  }

  if (result.eyeScore.missingSteps.length > 0 || result.eyeScore.eyeScore === null) {
    return (
      <div className="glass-card mx-auto max-w-sm p-6 text-center">
        <h1 className="text-lg font-bold text-white">Eksik Adımlar</h1>
        <ul className="mt-4 space-y-2 text-sm text-accent">
          {result.eyeScore.missingSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <Link href="/onboarding" className="btn-primary mt-6 inline-block">
          Devam Et
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2">
        <Link href="/onboarding" className="btn-secondary py-2 text-xs">
          Güncelle
        </Link>
        <Link href="/settings" className="btn-secondary py-2 text-xs">
          Ayarlar
        </Link>
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Tüm veriler silinecek. Emin misin?")) return;
            try {
              await fullSystemReset();
              window.location.replace("/");
            } catch (err) {
              alert(getUserErrorMessage(err));
            }
          }}
          className="rounded-xl border border-zinc-700/60 px-3 py-2 text-xs text-zinc-500 hover:text-red-400"
        >
          Sil
        </button>
      </div>
      <ResultsDashboard result={result} />
    </div>
  );
}
