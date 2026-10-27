"use client";

import type { CountryResult } from "@/lib/types";
import { AffinityRing } from "@/components/ui/AffinityRing";
import { getCountryFlag, getAppsForCountry } from "@/lib/data/country-apps";
import { SORT_OPTIONS, type SortKey } from "@/lib/data/country-intelligence";
import { getClusterNameById } from "@/lib/data/clusters";

interface Props {
  countries: CountryResult[];
  onSelect: (country: CountryResult) => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  isPinned: (code: string) => boolean;
  onTogglePin: (code: string) => void;
  compareMode?: boolean;
  compareCodes?: string[];
  onComparePick?: (country: CountryResult) => void;
}

function displayScore(country: CountryResult, sortKey: SortKey): number {
  return sortKey === "affinity"
    ? country.compatibility.affinity
    : country.compatibility[sortKey];
}

export function CountryAffinityList({
  countries,
  onSelect,
  sortKey,
  onSortChange,
  isPinned,
  onTogglePin,
  compareMode = false,
  compareCodes = [],
  onComparePick,
}: Props) {
  const safeCountries = countries ?? [];
  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Uyuma göre";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="section-label">Kültürel Uyum</p>
          <h2 className="text-lg font-semibold text-white lg:text-xl">Top Ülkelerin</h2>
        </div>
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="input appearance-none py-2 pr-8 text-[11px]"
            aria-label="Sıralama"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
            ▾
          </span>
        </div>
      </div>

      {compareMode && (
        <p className="mb-3 rounded-xl border border-accent-border bg-accent-dim px-3 py-2 text-xs text-accent-soft">
          Karşılaştırma modu: 2 ülke seç ({compareCodes.length}/2) — {sortLabel}
        </p>
      )}

      <div className="space-y-2.5 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {safeCountries.map((country, i) => {
          const code = country.compatibility.countryCode;
          const reasons = country.reasons ?? [];
          const apps = country.apps ?? getAppsForCountry(code);
          const clusterLabel = getClusterNameById(country.compatibility.clusterId);
          const traitLabel = reasons[0]?.label ?? apps[0]?.name ?? "Uyum analizi";
          const pinned = isPinned(code);
          const inCompare = compareCodes.includes(code);
          const score = Math.round(displayScore(country, sortKey));

          return (
            <div
              key={code}
              className={`glass-card grid grid-cols-[2rem_minmax(0,1fr)_3rem_2rem] items-center gap-2.5 p-3 sm:gap-3 sm:p-4 ${
                inCompare ? "ring-1 ring-accent-border" : ""
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                {pinned ? "★" : i + 1}
              </span>

              <button
                type="button"
                onClick={() => (compareMode ? onComparePick?.(country) : onSelect(country))}
                className="flex min-w-0 items-center gap-3 text-left active:scale-[0.99]"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 text-xl ring-1 ring-zinc-700/50"
                  aria-hidden
                >
                  {getCountryFlag(code)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {country.compatibility.countryName}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] leading-snug text-zinc-500">
                    {clusterLabel} · {traitLabel}
                  </p>
                </div>
              </button>

              <div
                className="flex justify-center"
                title={`${sortLabel}: ${score}`}
                aria-label={`${country.compatibility.countryName}, ${sortLabel} ${score}`}
              >
                <AffinityRing score={score} size={44} />
              </div>

              <button
                type="button"
                onClick={() => onTogglePin(code)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${
                  pinned ? "text-accent" : "text-zinc-600 hover:text-zinc-400"
                }`}
                aria-label={pinned ? "Sabitlemeyi kaldır" : "Sabitle"}
              >
                {pinned ? "★" : "☆"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
