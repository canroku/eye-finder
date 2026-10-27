"use client";

import type { CountryResult } from "@/lib/types";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/plans/PlanComparison";

interface Props {
  baseline: CountryResult[];
  compare?: CountryResult[];
  label?: string;
}

export function ProfileComparison({ baseline, compare, label = "Önceki analiz" }: Props) {
  const { limits } = useSubscription();

  if (!compare?.length) return null;

  if (!limits.profileComparison) {
    return (
      <UpgradePrompt required="plus" feature="Profil karşılaştırma — önceki analizle fark" />
    );
  }

  const map = new Map(compare.map((c) => [c.compatibility.countryCode, c.compatibility.affinity]));

  return (
    <div className="glass-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">Profil Karşılaştırma</h3>
      <p className="mb-3 text-xs text-zinc-500">{label} ile fark</p>
      <ul className="space-y-2">
        {baseline.slice(0, 8).map((c) => {
          const prev = map.get(c.compatibility.countryCode);
          const diff = prev != null ? c.compatibility.affinity - prev : null;
          return (
            <li key={c.compatibility.countryCode} className="flex justify-between text-sm">
              <span className="text-zinc-300">{c.compatibility.countryName}</span>
              <span
                className={
                  diff == null
                    ? "text-zinc-500"
                    : diff > 0
                      ? "text-emerald-400"
                      : diff < 0
                        ? "text-red-400"
                        : "text-zinc-400"
                }
              >
                {diff == null ? "—" : diff > 0 ? `+${diff}` : diff}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
