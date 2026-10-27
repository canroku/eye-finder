"use client";

import type { CountryResult } from "@/lib/types";
import { WorldMapChoropleth } from "@/components/results/WorldMapChoropleth";

interface Props {
  countries: CountryResult[];
  selectedCode?: string;
  onSelect: (country: CountryResult) => void;
}

export function InteractiveWorldMap({ countries, selectedCode, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            İnteraktif Dünya Haritası
          </h3>
          <p className="mt-0.5 text-xs text-zinc-600">
            Ülkeye tıkla — detay açılır · Sürükle · Tekerlek veya +/− ile yakınlaştır
          </p>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-xl border border-zinc-800/80"
        style={{ aspectRatio: "784.077 / 458.627" }}
        role="region"
        aria-label="Ülke uyum haritası"
      >
        <WorldMapChoropleth
          countries={countries}
          selectedCode={selectedCode}
          onSelect={onSelect}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {countries.slice(0, 8).map((c) => {
            const code = c.compatibility.countryCode;
            const name = c.compatibility.countryName;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onSelect(c)}
                title={name}
                className={`rounded-md border px-2 py-0.5 text-[10px] transition ${
                  selectedCode === code
                    ? "border-accent bg-accent-dim text-accent-soft"
                    : "border-zinc-800 text-zinc-400 hover:border-accent-dim"
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-zinc-600">
          <span
            className="mr-1 inline-block h-2 w-4 rounded-sm border border-zinc-600"
            style={{ background: "color-mix(in srgb, var(--accent) 70%, #3f3f46)" }}
          />
          Sonuç ülkeleri renklendirildi
        </p>
      </div>
    </div>
  );
}
