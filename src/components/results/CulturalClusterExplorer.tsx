"use client";

import type { CountryResult } from "@/lib/types";
import { CULTURAL_CLUSTERS } from "@/lib/data/clusters";
import { getCountryFlag } from "@/lib/data/country-apps";

interface Props {
  countries: CountryResult[];
  activeCluster: string | null;
  onClusterChange: (clusterId: string | null) => void;
  onSelect: (country: CountryResult) => void;
}

export function CulturalClusterExplorer({
  countries,
  activeCluster,
  onClusterChange,
  onSelect,
}: Props) {
  const clustersWithCounts = CULTURAL_CLUSTERS.map((cluster) => ({
    ...cluster,
    matches: countries.filter((c) => c.compatibility.clusterId === cluster.id),
  })).filter((c) => c.matches.length > 0);

  const visible = activeCluster
    ? countries.filter((c) => c.compatibility.clusterId === activeCluster)
    : countries;

  return (
    <div className="glass-card p-4">
      <p className="section-label mb-1">Kültürel Keşif</p>
      <h3 className="mb-3 text-base font-semibold text-white">Küme Haritası</h3>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onClusterChange(null)}
          className={`rounded-full px-3 py-1 text-[10px] font-medium ${
            activeCluster === null
              ? "bg-accent-dim text-accent ring-1 ring-accent-border"
              : "border border-zinc-700 text-zinc-400"
          }`}
        >
          Tümü
        </button>
        {clustersWithCounts.map((cluster) => (
          <button
            key={cluster.id}
            type="button"
            onClick={() => onClusterChange(cluster.id)}
            className={`rounded-full px-3 py-1 text-[10px] font-medium ${
              activeCluster === cluster.id
                ? "bg-accent-dim text-accent ring-1 ring-accent-border"
                : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {cluster.name} ({cluster.matches.length})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {visible.slice(0, 12).map((c) => (
          <button
            key={c.compatibility.countryCode}
            type="button"
            onClick={() => onSelect(c)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-2 py-1.5 text-xs transition hover:border-accent"
          >
            <span>{getCountryFlag(c.compatibility.countryCode)}</span>
            <span className="text-zinc-300">{c.compatibility.countryCode}</span>
            <span className="font-mono text-accent">{c.compatibility.affinity}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
