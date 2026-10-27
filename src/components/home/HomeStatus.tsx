"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { loadProfile, loadResult, RESET_EVENT } from "@/lib/storage";

export function HomeStatus() {
  const [score, setScore] = useState<number | null>(null);
  const [topCountry, setTopCountry] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => {
      Promise.all([loadProfile(), loadResult()]).then(([profile, result]) => {
        if (result?.eyeScore?.eyeScore) {
          setScore(result.eyeScore.eyeScore);
          setTopCountry(result.countries[0]?.compatibility.countryName ?? null);
        } else {
          setScore(null);
          setTopCountry(null);
        }
        setReady(true);
        void profile;
      });
    };

    load();
    window.addEventListener(RESET_EVENT, load);
    return () => window.removeEventListener(RESET_EVENT, load);
  }, []);

  if (!ready || score === null) return null;

  return (
    <GlassCard glow variant="hero" className="animate-pulse-glow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted">Son analizin hazır</p>
          <p className="text-3xl font-bold gradient-text">{score}</p>
          {topCountry && (
            <p className="mt-1 text-xs text-secondary">En uyumlu: {topCountry}</p>
          )}
        </div>
        <Link href="/results" className="btn-primary shrink-0 !w-auto px-5 py-2.5 text-sm">
          Sonuçları Gör
        </Link>
      </div>
    </GlassCard>
  );
}
