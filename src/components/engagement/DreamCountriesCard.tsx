"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { loadResult } from "@/lib/storage";
import { getCountryFlag } from "@/lib/data/country-apps";
import { useEngagement } from "@/hooks/useEngagement";

export function DreamCountriesCard() {
  const { state, setDreams } = useEngagement(false);
  const [options, setOptions] = useState<{ code: string; name: string; affinity: number }[]>([]);

  useEffect(() => {
    loadResult().then((result) => {
      setOptions(
        (result?.countries ?? []).slice(0, 8).map((c) => ({
          code: c.compatibility.countryCode,
          name: c.compatibility.countryName,
          affinity: c.compatibility.affinity,
        })),
      );
    });
  }, []);

  if (!options.length) {
    return (
      <GlassCard title="Hayal ülkelerin" subtitle="Hedef belirle">
        <p className="text-sm text-zinc-400">Analiz tamamlayınca en uyumlu ülkelerden 3 tanesini hedef olarak seçebilirsin.</p>
      </GlassCard>
    );
  }

  const toggle = (code: string) => {
    const set = new Set<string>(state.dreamCountries);
    if (set.has(code)) set.delete(code);
    else if (set.size < 3) set.add(code);
    setDreams(Array.from(set));
  };

  return (
    <GlassCard title="Hayal ülkelerin" subtitle="En fazla 3 hedef · rozet kazan">
      <div className="flex flex-wrap gap-2">
        {options.map((c) => {
          const active = state.dreamCountries.includes(c.code);
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => toggle(c.code)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-accent-border bg-accent-dim text-accent-soft"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {getCountryFlag(c.code)} {c.name} · {c.affinity}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
