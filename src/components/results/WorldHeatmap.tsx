"use client";

import type { CountryResult } from "@/lib/types";
import { getCountryFlag } from "@/lib/data/country-apps";

interface Props {
  countries: CountryResult[];
  onSelect: (country: CountryResult) => void;
}

export function WorldHeatmap({ countries, onSelect }: Props) {
  const max = Math.max(...countries.map((c) => c.compatibility.affinity), 1);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Küresel Isı Haritası
      </h3>
      <p className="mb-4 text-xs text-zinc-600">Renk yoğunluğu = ilgi potansiyeli</p>

      <div className="flex flex-wrap gap-2">
        {countries.map((c) => {
          const intensity = c.compatibility.affinity / max;
          const opacity = 0.25 + intensity * 0.75;
          return (
            <button
              key={c.compatibility.countryCode}
              type="button"
              onClick={() => onSelect(c)}
              title={`${c.compatibility.countryName}: ${c.compatibility.affinity}`}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-2 py-1.5 text-xs transition hover:border-accent"
              style={{
                backgroundColor: `color-mix(in srgb, var(--accent) ${Math.round(opacity * 35)}%, transparent)`,
              }}
            >
              <span>{getCountryFlag(c.compatibility.countryCode)}</span>
              <span className="text-zinc-300">{c.compatibility.countryCode}</span>
              <span className="font-mono text-accent">{c.compatibility.affinity}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
