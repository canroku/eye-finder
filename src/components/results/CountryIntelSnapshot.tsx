"use client";

import type { CountryInsightBundle } from "@/lib/premium/country-insights";

interface Props {
  insights: CountryInsightBundle;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px]">
        <span className="text-zinc-500">{label}</span>
        <span className="font-mono text-accent">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function CountryIntelSnapshot({ insights }: Props) {
  const { intel, strongestDimension, weakestDimension, matchSummary } = insights;

  return (
    <div className="glass-card-glow glass-card p-4">
      <p className="section-label mb-1">Odak Ülke</p>
      <h3 className="mb-2 text-base font-semibold text-white">{intel.name} — Hızlı Profil</h3>
      <p className="mb-4 text-sm text-zinc-400">{matchSummary}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-zinc-900/50 p-3">
          <p className="text-zinc-500">Başkent</p>
          <p className="font-medium text-white">{intel.capital}</p>
        </div>
        <div className="rounded-xl bg-zinc-900/50 p-3">
          <p className="text-zinc-500">Dil</p>
          <p className="font-medium text-white">{intel.languages.join(", ")}</p>
        </div>
        <div className="rounded-xl bg-zinc-900/50 p-3">
          <p className="text-zinc-500">Tempo</p>
          <p className="font-medium text-accent capitalize">{intel.datingPace}</p>
        </div>
        <div className="rounded-xl bg-zinc-900/50 p-3">
          <p className="text-zinc-500">İngilizce</p>
          <p className="font-medium text-white">{intel.englishLevel}/10</p>
        </div>
      </div>

      <div className="mb-4 grid gap-2">
        <ScoreBar label={`Güçlü: ${strongestDimension.label}`} value={strongestDimension.value} />
        <ScoreBar label={`Gelişim: ${weakestDimension.label}`} value={weakestDimension.value} />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
        {(
          [
            ["Gece", intel.lifestyleScores.nightlife],
            ["Outdoor", intel.lifestyleScores.outdoor],
            ["Fitness", intel.lifestyleScores.fitness],
            ["Expat", intel.lifestyleScores.expatFriendly],
          ] as const
        ).map(([label, val]) => (
          <div key={label} className="rounded-lg bg-zinc-900/40 p-2">
            <p className="text-zinc-500">{label}</p>
            <p className="font-bold text-white">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
