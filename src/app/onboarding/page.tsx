"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { PipelineErrorCard } from "@/components/onboarding/PipelineErrorCard";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { TierBadge } from "@/components/plans/TierBadge";
import { useSubscription } from "@/hooks/useSubscription";
import { runPipelineSafe } from "@/lib/pipeline/runner";
import { clearProfileDraft, saveProfile, saveResult } from "@/lib/storage";
import { prepareProfileForPipeline } from "@/lib/utils/photo-storage";
import { trackEvent } from "@/lib/analytics";
import { getUserErrorMessage } from "@/lib/errors";
import { withBasePath } from "@/lib/api";
import { isOnline } from "@/lib/network";
import { recordAnalysisComplete } from "@/lib/engagement/store";
import type { OnboardingMode } from "@/lib/data/personality-questions";
import { PageHeader } from "@/components/ui/PageHeader";
import { useRouter } from "next/navigation";

const STAGE_LABELS = [
  "Fotoğraflar hazırlanıyor…",
  "Skor motorları çalışıyor…",
  "Sonuçlar kaydediliyor…",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { tier, limits } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [stageDetail, setStageDetail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastProfile, setLastProfile] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<OnboardingMode>("standard");

  const handleComplete = async (profile: UserProfile) => {
    setLoading(true);
    setError(null);
    setStage(0);
    setStageDetail(null);
    setLastProfile(profile);
    trackEvent("onboarding_complete", { mode, online: isOnline() });

    try {
      await clearProfileDraft();
      setStage(0);
      const prepared = await prepareProfileForPipeline({ ...profile, onboardingMode: mode });

      setStage(1);
      const pipelineResult = await runPipelineSafe(prepared, {
        timeoutMs: 90_000,
        mode,
        maxCountries: limits.maxCountries >= 999 ? 999 : limits.maxCountries,
        onStage: (s, detail) => {
          if (s === "prepare") setStage(0);
          if (s === "analyze" || s === "countries") setStage(1);
          if (s === "done") setStage(2);
          if (detail) setStageDetail(detail);
        },
      });

      setStage(2);
      await saveResult(pipelineResult);
      await saveProfile(prepared);
      recordAnalysisComplete(pipelineResult.eyeScore.eyeScore ?? null);

      window.location.replace(withBasePath("/results"));
    } catch (err) {
      console.error("Pipeline failed:", err);
      trackEvent("pipeline_error", {
        message: err instanceof Error ? err.message : "unknown",
      });
      const msg = getUserErrorMessage(err);
      setError(msg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="glass-card animate-pulse-glow flex flex-col items-center p-8">
          <div
            className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-accent-dim border-t-accent"
            role="status"
            aria-label="Yükleniyor"
          />
          <p className="text-sm font-medium text-white">Algoritma çalışıyor</p>
          <p className="mt-1 text-xs text-accent-muted">
            {stageDetail ?? STAGE_LABELS[stage] ?? STAGE_LABELS[1]}
          </p>
          <p className="mt-3 text-[10px] text-zinc-600">Bu işlem birkaç saniye sürebilir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack animate-fade-in">
      <OfflineBanner />
      <PageHeader
        label="Analiz"
        title="Profilini oluştur"
        subtitle="Modunu seç ve adımları tamamla."
        action={<TierBadge tier={tier} />}
      />

      <div className="flex flex-wrap gap-2">
        {(["quick", "standard", "deep"] as OnboardingMode[]).map((m) => {
          const allowed = limits.onboardingModes.includes(m);
          const label =
            m === "quick" ? "Hızlı · 16 soru" : m === "deep" ? "Derin · 80 soru" : "Standart · 20 soru";
          return (
            <button
              key={m}
              type="button"
              disabled={!allowed}
              onClick={() => allowed && setMode(m)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                mode === m
                  ? "border-accent bg-accent-dim text-accent-soft"
                  : allowed
                    ? "border-white/10 bg-zinc-900 text-secondary hover:border-white/20"
                    : "cursor-not-allowed border-white/5 text-muted opacity-50"
              }`}
              title={!allowed ? `${m === "deep" ? "Pro" : "Plus"} gerekli` : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>

      {error && (
        <PipelineErrorCard
          message={error}
          onRetry={() => lastProfile && handleComplete(lastProfile)}
          onReset={() => router.push("/settings")}
        />
      )}
      <OnboardingWizard mode={mode} onComplete={handleComplete} />
    </div>
  );
}
