"use client";

import { useMemo, useState } from "react";
import type { CountryResult, UserProfile } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { TierBadge } from "@/components/plans/TierBadge";
import { UpgradePrompt } from "@/components/plans/PlanComparison";
import { useSubscription } from "@/hooks/useSubscription";
import { COUNTRY_MATRIX } from "@/lib/data/country-matrix";
import { getCountryFlag } from "@/lib/data/country-apps";
import { buildCountryReachGuide } from "@/lib/premium/country-guides";

interface Props {
  countries: CountryResult[];
  profile: UserProfile | null;
}

const ACTIVITY_COLORS: Record<string, string> = {
  top: "bg-violet-500",
  high: "bg-accent",
  medium: "bg-emerald-500/80",
  niche: "bg-zinc-500",
};

export function ProCountryReachExplorer({ countries, profile }: Props) {
  const { hasTier } = useSubscription();
  const isPro = hasTier("pro");

  const countryOptions = useMemo(
    () =>
      [...COUNTRY_MATRIX]
        .sort((a, b) => a.name.localeCompare(b.name, "tr"))
        .map((c) => ({
          value: c.code,
          label: c.name,
          icon: getCountryFlag(c.code),
        })),
    [],
  );

  const affinityMap = useMemo(() => {
    const map = new Map<string, number>();
    countries.forEach((c) => map.set(c.compatibility.countryCode, c.compatibility.affinity));
    return map;
  }, [countries]);

  const defaultCode =
    countries[0]?.compatibility.countryCode ?? countryOptions[0]?.value ?? "TR";

  const [selectedCode, setSelectedCode] = useState(defaultCode);

  const selectedEntry = countryOptions.find((c) => c.value === selectedCode) ?? countryOptions[0];
  const guide = selectedEntry
    ? buildCountryReachGuide(
        selectedEntry.value,
        selectedEntry.label,
        profile,
        affinityMap.get(selectedEntry.value) ?? null,
      )
    : null;

  return (
    <section className="pro-exclusive-block mt-2 space-y-4">
      <div className="pro-exclusive-header">
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier="pro" />
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
            Pro özel
          </span>
        </div>
        <h2 className="mt-3 text-xl font-semibold text-white lg:text-2xl">
          Global Ulaşım Rehberi
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-secondary">
          Analiz sonrası istediğin ülkeyi seç — oradaki insanlara nasıl ulaşacağını, hangi
          uygulamalarda ve mekanlarda aktif olduklarını keşfet.
        </p>
      </div>

      {!isPro ? (
        <GlassCard glow className="border-violet-500/20">
          <UpgradePrompt
            required="pro"
            feature="Herhangi bir ülke için kişisel ulaşım ve tanışma rehberi"
          />
        </GlassCard>
      ) : (
        <>
          <GlassCard glow className="border-violet-500/25">
            <label htmlFor="reach-country" className="section-label">
              Ülke seç
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchableSelect
                id="reach-country"
                value={selectedCode}
                onChange={setSelectedCode}
                options={countryOptions}
                placeholder="Ülke seçin"
                searchPlaceholder="Ülke ara…"
                aria-label="Ülke seç"
                className="flex-1"
              />
              {selectedEntry && (
                <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-2">
                  <span className="text-2xl">{selectedEntry.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedEntry.label}</p>
                    {guide?.affinity != null && (
                      <p className="text-xs text-violet-300">Uyum: %{guide.affinity}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {guide && (
            <>
              <GlassCard glow className="border-violet-500/20">
                <p className="text-lg font-semibold text-white">{guide.headline}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{guide.appVsRealLife}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <Tag>Tempo: {guide.datingPace}</Tag>
                  <Tag>Doğrudanlık: {guide.datingDirectness}/10</Tag>
                  <Tag>Sezon: {guide.bestSeason}</Tag>
                </div>
              </GlassCard>

              <GlassCard title="Uygulamalarda nerede aktifler?" subtitle="Popülerlik & aktivite">
                <div className="space-y-3">
                  {guide.apps.map((app) => (
                    <div
                      key={app.name}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {app.name}
                            <span className="ml-2 text-[10px] font-normal text-zinc-500">
                              {app.type === "local" ? "Yerel" : "Global"}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">{app.description}</p>
                        </div>
                        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                          {app.activityLabel}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className={`h-full rounded-full ${ACTIVITY_COLORS[app.activityLevel] ?? "bg-zinc-500"}`}
                            style={{ width: `${app.popularity}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500">{app.popularity}%</span>
                      </div>
                      {app.url && (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-[11px] text-accent hover:underline"
                        >
                          Platformu aç →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="grid gap-4 lg:grid-cols-2">
                <GlassCard title="Online — nasıl ulaşırsın?">
                  <ol className="space-y-2">
                    {guide.onlineSteps.map((step, i) => (
                      <li key={step} className="flex gap-2 text-xs text-zinc-300">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </GlassCard>

                <GlassCard title="Gerçek hayatta — nerede buluşursun?">
                  <ol className="space-y-2">
                    {guide.offlineSteps.map((step, i) => (
                      <li key={step} className="flex gap-2 text-xs text-zinc-300">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-dim text-[10px] font-bold text-accent">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </GlassCard>
              </div>

              <GlassCard title="Aktif buluşma noktaları">
                <div className="grid gap-2 sm:grid-cols-2">
                  {guide.offlineHotspots.map((spot) => (
                    <div
                      key={spot.place}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3"
                    >
                      <p className="text-sm font-medium text-white">{spot.place}</p>
                      <p className="mt-1 text-xs text-zinc-500">{spot.detail}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="grid gap-4 lg:grid-cols-2">
                <GlassCard title="İlk mesaj fikirleri">
                  <ul className="space-y-2">
                    {guide.messageTemplates.map((t) => (
                      <li key={t} className="rounded-xl bg-zinc-900/60 p-3 text-xs text-zinc-300">
                        “{t}”
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                <GlassCard title="Sohbet açılışları">
                  <ul className="space-y-2">
                    {guide.conversationStarters.map((t) => (
                      <li key={t} className="flex gap-2 text-xs text-zinc-300">
                        <span className="text-accent">→</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>

              <p className="text-center text-[11px] text-zinc-600">{guide.safetyNote}</p>
            </>
          )}
        </>
      )}
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-zinc-700/50 bg-zinc-900/60 px-2.5 py-1 text-zinc-400">
      {children}
    </span>
  );
}
