"use client";

import type { CountryResult, DatingAppInfo } from "@/lib/types";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AffinityRing } from "@/components/ui/AffinityRing";
import { ACTIVITY_LABELS, getAppsForCountry, getCountryFlag, getTopAppForCountry } from "@/lib/data/country-apps";
import { genderLabel } from "@/lib/engines/archetype-generator";
import { DisclaimerBanner } from "@/components/legal/DisclaimerBanner";
import { AlgorithmInsights } from "@/components/results/AlgorithmInsights";
import { MiniRegionMap } from "@/components/results/MiniRegionMap";
import type { CountryInsightBundle } from "@/lib/premium/country-insights";

type TabId = "overview" | "culture" | "dating" | "profile";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Genel" },
  { id: "culture", label: "Kültür" },
  { id: "dating", label: "Tanışma" },
  { id: "profile", label: "Profil" },
];

interface Props {
  country: CountryResult;
  insights: CountryInsightBundle;
  onClose: () => void;
  onCompare?: () => void;
  fullArchetypes?: boolean;
}

export function CountryDetailPanel({
  country,
  insights,
  onClose,
  onCompare,
  fullArchetypes = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const { compatibility } = country;
  const { intel } = insights;
  const reasons = country.reasons ?? [];
  const apps = getAppsForCountry(compatibility.countryCode);
  const visibleArchetypes = fullArchetypes ? (country.archetypes ?? []) : (country.archetypes ?? []).slice(0, 1);
  const topApp = getTopAppForCountry(compatibility.countryCode);
  const globalApps = apps.filter((a) => a.type === "global");
  const localApps = apps.filter((a) => a.type === "local");

  useEffect(() => {
    setMounted(true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center lg:items-center lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="country-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div className="animate-slide-up relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-t-3xl border border-zinc-700/60 bg-zinc-950 shadow-2xl lg:max-h-[85vh] lg:max-w-2xl lg:rounded-3xl">
        <div className="shrink-0 border-b border-zinc-800/80 p-5 pb-3">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-3xl">{getCountryFlag(compatibility.countryCode)}</span>
              <div className="min-w-0">
                <h2
                  id="country-detail-title"
                  className="truncate text-lg font-bold uppercase tracking-wide text-white lg:text-xl"
                >
                  {compatibility.countryName}
                </h2>
                <p className="text-xs text-zinc-500">
                  {intel.clusterName} · {intel.datingPace} tempo
                </p>
              </div>
            </div>
            <AffinityRing score={compatibility.affinity} size={64} />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                  tab === t.id
                    ? "bg-accent text-zinc-950"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-3">
          {tab === "overview" && (
            <>
              <p className="mb-4 text-sm text-zinc-400">{insights.matchSummary}</p>
              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
                <MiniRegionMap countryCode={compatibility.countryCode} countryName={compatibility.countryName} />
                <div className="glass-card flex flex-col justify-center p-3 lg:col-span-1">
                  <p className="section-label mb-2">Uyum Boyutları</p>
                  <DimRow label="Fiziksel" value={compatibility.physical} />
                  <DimRow label="Yaşam" value={compatibility.lifestyle} />
                  <DimRow label="Kişilik" value={compatibility.personality} />
                  <DimRow label="İlişki" value={compatibility.relationship} />
                  <DimRow label="Sosyal" value={compatibility.social} />
                </div>
                {reasons.length > 0 && (
                  <div className="glass-card col-span-2 p-3 lg:col-span-1">
                    <AlgorithmInsights reasons={reasons.slice(0, 4)} title="Insights" />
                  </div>
                )}
              </div>
              {!fullArchetypes && visibleArchetypes.length > 0 && (
                <p className="mb-3 text-xs text-zinc-500">Plus+ ile tüm arketipler açılır.</p>
              )}
              {visibleArchetypes.length > 0 && (
                <ArchetypeSection archetypes={visibleArchetypes} truncated={!fullArchetypes} />
              )}
            </>
          )}

          {tab === "culture" && (
            <>
              <InfoGrid
                items={[
                  ["Başkent", intel.capital],
                  ["Dil", intel.languages.join(", ")],
                  ["Saat dilimi", intel.timezone],
                  ["Para birimi", intel.currency],
                  ["En iyi sezon", intel.bestSeason],
                  ["Bul. maliyeti", intel.avgDateCost],
                ]}
              />
              <TagSection title="Kültürel güçler" items={intel.culturalStrengths} accent />
              <TagSection title="Sosyal normlar" items={intel.socialNorms} />
              <TagSection title="Kaçınılması gerekenler" items={intel.taboos} warn />
              <p className="mt-3 text-xs text-zinc-500">{intel.safetyNote}</p>
              {insights.homeContrast && (
                <p className="mt-2 rounded-xl bg-zinc-900/60 p-3 text-xs text-accent-soft">
                  {insights.homeContrast}
                </p>
              )}
            </>
          )}

          {tab === "dating" && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-2 text-center text-xs">
                <StatCard label="Doğrudanlık" value={`${intel.datingDirectness}/10`} />
                <StatCard label="Tempo" value={intel.datingPace} />
                <StatCard label="İngilizce" value={`${intel.englishLevel}/10`} />
                <StatCard label="App vs gerçek" value="→" sub={intel.appVsRealLife.slice(0, 40) + "…"} />
              </div>
              <p className="mb-3 text-sm text-zinc-400">{intel.appVsRealLife}</p>
              <TagSection title="İlk buluşma fikirleri" items={intel.firstDateIdeas} accent />
              <TagSection title="Tanışma mekanları" items={intel.meetingPlaces} />
              <TagSection title="Yerel adetler" items={intel.localCustoms} />
              <div className="glass-card mt-4 p-4">
                <p className="section-label mb-1">Tanışma Uygulamaları</p>
                {topApp && (
                  <p className="mb-3 text-xs text-zinc-500">
                    En aktif: <span className="text-emerald-400">{topApp.name}</span>
                  </p>
                )}
                {globalApps.length > 0 && <AppGroup label="Global" apps={globalApps} badgeClass="text-accent/80" />}
                {localApps.length > 0 && <AppGroup label="Yerel" apps={localApps} badgeClass="text-zinc-400" />}
              </div>
            </>
          )}

          {tab === "profile" && (
            <>
              <TagSection title="Profil optimizasyonu" items={intel.profileTips} accent />
              <div className="glass-card mt-4 p-4">
                <p className="section-label mb-2">Konuşma açılışları</p>
                <ul className="space-y-2">
                  {insights.personalizedStarters.map((s) => (
                    <li key={s} className="rounded-lg bg-zinc-900/60 p-3 text-xs text-zinc-300">
                      “{s}”
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-xs text-zinc-500">{intel.greetingStyle}</p>
            </>
          )}
        </div>

        <div className="shrink-0 flex gap-2 border-t border-zinc-800/80 p-4">
          {onCompare && (
            <button type="button" onClick={onCompare} className="btn-ghost flex-1">
              Karşılaştır
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Kapat
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ArchetypeSection({
  archetypes,
  truncated,
}: {
  archetypes: CountryResult["archetypes"];
  truncated: boolean;
}) {
  return (
    <div className="glass-card p-4">
      <DisclaimerBanner variant="warning">
        Arketipler gerçek kişi değil — kültürel tercih modelidir.
      </DisclaimerBanner>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {archetypes.map((arch) => (
          <div key={arch.id} className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-white">
                {arch.label}{" "}
                <span className="text-xs text-zinc-500">· {genderLabel(arch.gender)}</span>
              </span>
              <span className="text-sm font-bold text-accent">{arch.matchScore}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="mb-1 text-zinc-500">Dış</p>
                {(arch.externalBeauty?.traits ?? []).slice(0, truncated ? 1 : 2).map((t) => (
                  <p key={t} className="text-zinc-400">
                    · {t}
                  </p>
                ))}
              </div>
              <div>
                <p className="mb-1 text-zinc-500">İç</p>
                {(arch.internalBeauty?.traits ?? []).slice(0, truncated ? 1 : 2).map((t) => (
                  <p key={t} className="text-zinc-400">
                    · {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-zinc-900/50 p-3">
          <p className="text-zinc-500">{label}</p>
          <p className="font-medium text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

function TagSection({
  title,
  items,
  accent,
  warn,
}: {
  title: string;
  items: string[];
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="mb-4">
      <p className="section-label mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={`flex gap-2 text-xs ${warn ? "text-red-300/90" : accent ? "text-zinc-300" : "text-zinc-400"}`}
          >
            <span className={warn ? "text-red-400" : "text-accent"}>{warn ? "−" : "→"}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-zinc-900/50 p-3">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="font-semibold capitalize text-white">{value}</p>
      {sub && <p className="mt-1 text-[9px] text-zinc-600">{sub}</p>}
    </div>
  );
}

function DimRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-1.5 flex justify-between text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono text-accent">{value}</span>
    </div>
  );
}

function AppGroup({
  label,
  apps,
  badgeClass,
}: {
  label: string;
  apps: DatingAppInfo[];
  badgeClass: string;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className={`mb-2 text-[10px] font-semibold uppercase ${badgeClass}`}>{label}</p>
      <div className="space-y-2">
        {apps.map((app) => (
          <div key={app.name} className="rounded-lg bg-zinc-900/50 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                {app.url ? (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white hover:text-accent"
                  >
                    {app.name} ↗
                  </a>
                ) : (
                  <span className="text-sm font-medium text-white">{app.name}</span>
                )}
              </div>
              <ActivityBadge level={app.activityLevel} />
              <span className="shrink-0 font-mono text-xs text-accent">{app.popularity}</span>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-zinc-500">{app.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityBadge({ level }: { level: DatingAppInfo["activityLevel"] }) {
  const styles: Record<DatingAppInfo["activityLevel"], string> = {
    top: "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30",
    high: "bg-accent/15 text-accent ring-accent-dim",
    medium: "bg-zinc-700/40 text-zinc-300 ring-zinc-600/40",
    niche: "bg-zinc-800/60 text-zinc-500 ring-zinc-700/40",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ring-1 ${styles[level]}`}
    >
      {ACTIVITY_LABELS[level]}
    </span>
  );
}
