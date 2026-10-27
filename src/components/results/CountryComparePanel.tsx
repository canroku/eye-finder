"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { CountryResult } from "@/lib/types";
import { compareCountries } from "@/lib/premium/country-insights";
import { getCountryFlag } from "@/lib/data/country-apps";
import { AffinityRing } from "@/components/ui/AffinityRing";

interface Props {
  left: CountryResult;
  right: CountryResult;
  onClose: () => void;
}

export function CountryComparePanel({ left, right, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const rows = compareCountries(left, right);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center lg:items-center lg:p-8" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 z-0 bg-black/80 backdrop-blur-md" onClick={onClose} aria-label="Kapat" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-zinc-700/60 bg-zinc-950 p-5 lg:rounded-3xl">
        <h2 className="mb-4 text-lg font-bold text-white">Ülke Karşılaştırması</h2>

        <div className="mb-5 grid grid-cols-2 gap-3">
          {[left, right].map((c) => (
            <div key={c.compatibility.countryCode} className="glass-card p-3 text-center">
              <span className="text-2xl">{getCountryFlag(c.compatibility.countryCode)}</span>
              <p className="mt-1 text-xs font-semibold uppercase text-white">{c.compatibility.countryName}</p>
              <div className="mt-2 flex justify-center">
                <AffinityRing score={c.compatibility.affinity} size={48} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{row.label}</p>
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <span className="font-mono text-accent">{row.a}</span>
                <span className="font-mono text-violet-300">{row.b}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${Math.max(5, (row.a / (row.a + row.b || 1)) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-center text-[10px] text-zinc-500">
                Fark: {row.diff > 0 ? "+" : ""}
                {row.diff} ({left.compatibility.countryCode} lehine)
              </p>
            </div>
          ))}
        </div>

        <button type="button" onClick={onClose} className="btn-secondary mt-4 w-full">
          Kapat
        </button>
      </div>
    </div>,
    document.body,
  );
}
