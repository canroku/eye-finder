"use client";

import type { CountryResult } from "@/lib/types";
import { useState } from "react";
import { apiPost } from "@/lib/errors";
import { trackEvent } from "@/lib/analytics";
import { getCountryFlag } from "@/lib/data/country-apps";

interface Props {
  countries: CountryResult[];
}

type Vote = "yes" | "partial" | "no";

const VOTES: { id: Vote; label: string; emoji: string }[] = [
  { id: "yes", label: "Evet", emoji: "👍" },
  { id: "partial", label: "Kısmen", emoji: "🤔" },
  { id: "no", label: "Hayır", emoji: "👎" },
];

export function CountryFeedback({ countries }: Props) {
  const top = countries.slice(0, 5);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const submit = async (country: CountryResult, vote: Vote) => {
    const code = country.compatibility.countryCode;
    setSaving(code);
    setVotes((v) => ({ ...v, [code]: vote }));
    try {
      await apiPost("/api/country-feedback", {
        countryCode: code,
        countryName: country.compatibility.countryName,
        affinity: country.compatibility.affinity,
        vote,
        ts: new Date().toISOString(),
      });
      trackEvent("feedback_submit", { country: code, vote });
      setDone((d) => new Set(d).add(code));
    } catch {
      setVotes((v) => {
        const next = { ...v };
        delete next[code];
        return next;
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Top ülkeler senin için doğru mu? Beta geri bildirimin algoritmayı iyileştirir.
      </p>
      {top.map((c) => {
        const code = c.compatibility.countryCode;
        const submitted = done.has(code);
        return (
          <div
            key={code}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {getCountryFlag(code)} {c.compatibility.countryName}
              </span>
              <span className="font-mono text-xs text-accent">{c.compatibility.affinity}</span>
            </div>
            {submitted ? (
              <p className="text-xs text-emerald-400">Teşekkürler — geri bildirimin kaydedildi ✓</p>
            ) : (
              <div className="flex gap-2">
                {VOTES.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={saving === code}
                    onClick={() => submit(c, id)}
                    className={`flex-1 rounded-lg border py-2 text-xs transition ${
                      votes[code] === id
                        ? "border-accent bg-accent-dim text-accent-soft"
                        : "border-zinc-700 text-zinc-400 hover:border-accent-dim"
                    }`}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
