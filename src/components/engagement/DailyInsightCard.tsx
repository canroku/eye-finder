"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { loadResult } from "@/lib/storage";
import { getCountryFlag } from "@/lib/data/country-apps";
import { getCountryIntel } from "@/lib/data/country-intelligence";
import { useEngagement } from "@/hooks/useEngagement";

export function DailyInsightCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [country, setCountry] = useState<{ code: string; name: string; affinity: number } | null>(
    null,
  );
  const { state } = useEngagement(false);

  useEffect(() => {
    loadResult().then((result) => {
      const top = result?.countries[0];
      if (!top) {
        setInsight(null);
        return;
      }
      const intel = getCountryIntel(top.compatibility.countryCode, top.compatibility.countryName);
      const tips = [
        intel.conversationStarters[0],
        intel.profileTips[0],
        intel.firstDateIdeas[0],
      ].filter(Boolean);
      const dayIndex = new Date().getDate() % tips.length;
      setCountry({
        code: top.compatibility.countryCode,
        name: top.compatibility.countryName,
        affinity: top.compatibility.affinity,
      });
      setInsight(tips[dayIndex] ?? intel.greetingStyle);
    });
  }, []);

  if (!insight || !country) return null;

  return (
    <GlassCard title="Günün ipucu" subtitle={`${getCountryFlag(country.code)} ${country.name} · %${country.affinity}`}>
      <p className="text-sm leading-relaxed text-zinc-300">{insight}</p>
      {state.dreamCountries.includes(country.code) && (
        <p className="mt-2 text-xs text-accent">★ Hayal listende — hedefinle uyumlu</p>
      )}
      <Link href="/results" className="mt-3 inline-block text-xs text-accent hover:underline">
        Detaylı analize git →
      </Link>
    </GlassCard>
  );
}
