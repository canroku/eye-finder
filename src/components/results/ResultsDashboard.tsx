"use client";

import type { CountryResult, PipelineResult, UserProfile } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RadarChart } from "@/components/ui/RadarChart";
import { CountryAffinityList } from "@/components/results/CountryAffinityList";
import { CountryDetailPanel } from "@/components/results/CountryDetailPanel";
import { CountryComparePanel } from "@/components/results/CountryComparePanel";
import { CountryIntelSnapshot } from "@/components/results/CountryIntelSnapshot";
import { CulturalClusterExplorer } from "@/components/results/CulturalClusterExplorer";
import { ShareButton } from "@/components/results/ShareButton";
import { ShareCard } from "@/components/results/ShareCard";
import { InteractiveWorldMap } from "@/components/results/InteractiveWorldMap";
import { ProfileComparison } from "@/components/results/ProfileComparison";
import { GlobalProfileCard } from "@/components/results/GlobalProfileCard";
import { CountryFeedback } from "@/components/results/CountryFeedback";
import { ExportReport } from "@/components/results/ExportReport";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { WorldHeatmap } from "@/components/results/WorldHeatmap";
import { ScoreBreakdown } from "@/components/results/ScoreBreakdown";
import { AlgorithmInsights } from "@/components/results/AlgorithmInsights";
import { DisclaimerBanner } from "@/components/legal/DisclaimerBanner";
import { interestedInLabel } from "@/lib/engines/archetype-generator";
import { getLearningStatus } from "@/lib/engines/global-learning";
import { normalizePipelineResult } from "@/lib/normalize-result";
import { loadProfile, loadPreviousResult } from "@/lib/storage";
import { analyzeStyleFromProfile } from "@/lib/engines/style-cv";
import { useSubscription } from "@/hooks/useSubscription";
import { usePinnedCountries } from "@/hooks/usePinnedCountries";
import { buildCountryGuideLite, buildSocialActionPlan } from "@/lib/premium/country-guides";
import { buildCountryInsights } from "@/lib/premium/country-insights";
import { sortCountries, type SortKey } from "@/lib/data/country-intelligence";
import { COUNTRY_MATRIX } from "@/lib/data/country-matrix";
import { CountryGuidePanel } from "@/components/premium/CountryGuidePanel";
import { SocialActionPlanPanel } from "@/components/premium/SocialActionPlanPanel";
import { ProCountryReachExplorer } from "@/components/premium/ProCountryReachExplorer";
import { TierBadge } from "@/components/plans/TierBadge";
import { recordComparisonDone, recordCountryView } from "@/lib/engagement/store";

interface Props {
  result: PipelineResult;
}

export function ResultsDashboard({ result: rawResult }: Props) {
  const { tier, limits } = useSubscription();
  const { pinned, togglePin, isPinned } = usePinnedCountries();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [previousCountries, setPreviousCountries] = useState<CountryResult[] | null>(null);
  const [selected, setSelected] = useState<CountryResult | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("affinity");
  const [clusterFilter, setClusterFilter] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareCodes, setCompareCodes] = useState<string[]>([]);
  const [comparePair, setComparePair] = useState<[CountryResult, CountryResult] | null>(null);

  useEffect(() => {
    loadProfile().then(setProfile);
    loadPreviousResult().then((prev) => setPreviousCountries(prev?.countries ?? null));
  }, []);

  const result = useMemo(
    () => normalizePipelineResult(rawResult, profile),
    [rawResult, profile],
  );

  const { eyeScore, countries: allCountries } = result;
  const tierCountries = useMemo(
    () => allCountries.slice(0, limits.maxCountries),
    [allCountries, limits.maxCountries],
  );

  const filteredCountries = useMemo(() => {
    let list = tierCountries;
    if (clusterFilter) {
      list = list.filter((c) => c.compatibility.clusterId === clusterFilter);
    }
    return sortCountries(list, sortKey, pinned);
  }, [tierCountries, clusterFilter, sortKey, pinned]);

  const score = eyeScore.eyeScore ?? 0;
  const subs = eyeScore.subScores ?? {};
  const pa = eyeScore.photoAnalysis;
  const learning = getLearningStatus(result.signalCount ?? 0);
  const topReasons = filteredCountries[0]?.reasons ?? [];
  const styleCv = profile ? analyzeStyleFromProfile(profile) : null;

  const radarAxes = [
    { label: "Physical", value: subs.physical ?? 0 },
    { label: "Lifestyle", value: subs.lifestyle ?? 0 },
    { label: "Social", value: subs.social ?? 0 },
    { label: "Personality", value: subs.personality ?? 0 },
    { label: "Photo", value: subs.photo ?? 0 },
  ];

  const displayName =
    profile?.demographics?.city ||
    profile?.identity?.bio?.slice(0, 12) ||
    "Profil";

  const homeCode = useMemo(() => {
    const raw = profile?.demographics?.country;
    if (!raw) return undefined;
    const upper = raw.toUpperCase();
    const byCode = COUNTRY_MATRIX.find((c) => c.code === upper);
    if (byCode) return byCode.code;
    return COUNTRY_MATRIX.find((c) =>
      c.name.toLowerCase().includes(raw.toLowerCase()) ||
      raw.toLowerCase().includes(c.name.toLowerCase()),
    )?.code;
  }, [profile]);
  const focusCountry = selected ?? filteredCountries[0] ?? null;

  const focusInsights = focusCountry
    ? buildCountryInsights(focusCountry, profile, homeCode)
    : null;

  const guide = focusCountry
    ? buildCountryGuideLite(
        focusCountry.compatibility.countryCode,
        focusCountry.compatibility.countryName,
        profile,
      )
    : null;

  const socialPlan =
    focusCountry && profile
      ? buildSocialActionPlan(
          focusCountry.compatibility.countryCode,
          focusCountry.compatibility.countryName,
          profile,
          Math.round(focusCountry.compatibility.affinity),
        )
      : null;

  const selectedInsights = selected
    ? buildCountryInsights(selected, profile, homeCode)
    : null;

  const handleSelectCountry = (country: CountryResult) => {
    setSelected(country);
    recordCountryView(country.compatibility.countryCode);
  };

  const handleComparePick = (country: CountryResult) => {
    const code = country.compatibility.countryCode;
    setCompareCodes((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      if (prev.length >= 2) return [prev[1], code];
      const next = [...prev, code];
      if (next.length === 2) {
        const a = tierCountries.find((c) => c.compatibility.countryCode === next[0]);
        const b = tierCountries.find((c) => c.compatibility.countryCode === next[1]);
        if (a && b) {
          setComparePair([a, b]);
          recordComparisonDone();
          setCompareMode(false);
          setCompareCodes([]);
        }
      }
      return next;
    });
  };

  return (
    <div className="animate-fade-in space-y-5 lg:space-y-6">
      <DisclaimerBanner>
        Eşleştirme değil — küresel tercih uyumu analizi. Skorlar yargı değil, tahmindir.
      </DisclaimerBanner>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-zinc-500">Merhaba, {displayName}</p>
          <h1 className="text-xl font-bold text-white lg:text-2xl">Dünyanı Keşfet</h1>
          <div className="mt-2">
            <TierBadge tier={tier} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ExportReport result={result} profile={profile} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setCompareMode((v) => !v);
                setCompareCodes([]);
              }}
              className={`rounded-xl border px-3 py-2 text-xs ${
                compareMode
                  ? "border-accent-border bg-accent-dim text-accent-soft"
                  : "border-zinc-700/60 bg-zinc-900/60 text-zinc-300"
              }`}
            >
              {compareMode ? "Karşılaştırmayı iptal" : "2 ülke karşılaştır"}
            </button>
            <ShareButton result={result} />
            <ShareCard result={result} />
          </div>
        </div>
      </div>

      {profile?.identity && (
        <div className="flex flex-wrap gap-2">
          <Tag>{interestedInLabel(profile.identity.interestedIn)}</Tag>
          <Tag>
            {profile.identity.agePreferenceMin}–{profile.identity.agePreferenceMax} yaş
          </Tag>
          {pa && <Tag>{pa.photosWithFace} yüz tespiti</Tag>}
          <Tag>{filteredCountries.length} ülke · {pinned.length} sabit</Tag>
        </div>
      )}

      {focusInsights && <CountryIntelSnapshot insights={focusInsights} />}

      {profile && <GlobalProfileCard result={result} profile={profile} />}

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <div className="space-y-5 lg:space-y-6">
          <GlassCard subtitle="Explore Your World" title="Profil Radarı" glow>
            <RadarChart
              axes={radarAxes}
              centerScore={score}
              centerLabel="Global Eye Score"
            />
            <div className="mt-4 grid grid-cols-5 gap-1 text-center">
              {radarAxes.map((a) => (
                <div key={a.label}>
                  <p className="text-[10px] text-zinc-500">{a.label}</p>
                  <p className="text-xs font-bold text-accent">{a.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {pa && (
            <GlassCard subtitle="Yüz Analizi" title="Face Scan">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Analiz derinliği</span>
                <span className="font-mono text-accent">{pa.analysisDepth ?? 0}%</span>
              </div>
              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${pa.analysisDepth ?? 0}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <Metric label="Simetri" value={pa.averageSymmetry} />
                <Metric label="Göz" value={pa.averageEyeOpenness ?? 0} />
                <Metric label="Poz" value={pa.averagePoseScore ?? 0} />
                <Metric label="Yüz Skoru" value={pa.faceScanScore} />
                <Metric label="Tutarlılık" value={pa.consistencyScore ?? 0} />
                <Metric label="Gülümseme" value={pa.averageSmile} />
                <Metric label="Fotoğraf" value={`${pa.photosWithFace}/${pa.totalPhotos ?? pa.photosWithFace}`} />
                {(pa.photoCountBonus ?? 0) > 0 && (
                  <Metric label="Bonus" value={`+${pa.photoCountBonus}`} />
                )}
              </div>
            </GlassCard>
          )}

          {styleCv && (
            <GlassCard subtitle="Stil CV" title="Görsel Profil">
              <p className="text-sm text-zinc-300">{styleCv.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {styleCv.tags.map((t) => (
                  <span key={t} className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
                    {t}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          <ProfileComparison baseline={filteredCountries} compare={previousCountries ?? undefined} />

          {limits.globalLearning && (
            <GlassCard subtitle="Global DB" title="Öğrenme Durumu">
              <p className="mb-3 text-sm text-zinc-400">{learning.label}</p>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${learning.progress}%` }}
                />
              </div>
            </GlassCard>
          )}
        </div>

        <CountryAffinityList
          countries={filteredCountries}
          onSelect={handleSelectCountry}
          sortKey={sortKey}
          onSortChange={setSortKey}
          isPinned={isPinned}
          onTogglePin={togglePin}
          compareMode={compareMode}
          compareCodes={compareCodes}
          onComparePick={handleComparePick}
        />
      </div>

      <CulturalClusterExplorer
        countries={tierCountries}
        activeCluster={clusterFilter}
        onClusterChange={setClusterFilter}
        onSelect={handleSelectCountry}
      />

      {guide && <CountryGuidePanel guide={guide} />}
      {socialPlan && <SocialActionPlanPanel plan={socialPlan} />}

      {allCountries.length > tierCountries.length && (
        <p className="text-center text-xs text-zinc-500">
          {allCountries.length - tierCountries.length} ülke daha var —
          <a href="/plans" className="ml-1 text-accent hover:underline">
            planı yükselt
          </a>
        </p>
      )}

      <InteractiveWorldMap
        countries={filteredCountries}
        selectedCode={selected?.compatibility.countryCode}
        onSelect={handleSelectCountry}
      />

      <WorldHeatmap countries={filteredCountries} onSelect={handleSelectCountry} />

      <GlassCard title="Ülke Geri Bildirimi" subtitle="Beta — Doğru mu?">
        <CountryFeedback countries={filteredCountries} />
      </GlassCard>

      <GlassCard title="Genel Geri Bildirim" subtitle="Beta">
        <FeedbackForm />
      </GlassCard>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        <ScoreBreakdown eyeScore={eyeScore} />
        {topReasons.length > 0 && (
          <GlassCard subtitle="Neden Motoru" title="Algorithm Insights">
            <AlgorithmInsights reasons={topReasons} title="" />
          </GlassCard>
        )}
      </div>

      {selected && selectedInsights && (
        <CountryDetailPanel
          country={selected}
          insights={selectedInsights}
          onClose={() => setSelected(null)}
          fullArchetypes={limits.fullArchetype}
          onCompare={() => {
            setCompareMode(true);
            setCompareCodes([selected.compatibility.countryCode]);
            setSelected(null);
          }}
        />
      )}

      {comparePair && (
        <CountryComparePanel
          left={comparePair[0]}
          right={comparePair[1]}
          onClose={() => setComparePair(null)}
        />
      )}

      <ProCountryReachExplorer countries={allCountries} profile={profile} />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-zinc-700/50 bg-zinc-900/60 px-3 py-1 text-[10px] text-zinc-400">
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
