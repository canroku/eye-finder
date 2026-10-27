"use client";

import { useState } from "react";
import { getMyReferralCode } from "@/lib/referral";
import { trackEvent } from "@/lib/analytics";
import { recordShareDone } from "@/lib/engagement/store";
import type { PipelineResult } from "@/lib/types";

interface Props {
  result: PipelineResult;
}

export function ShareButton({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const text = buildShareText(result);

  const copy = async () => {
    try {
      const ref = getMyReferralCode();
      await navigator.clipboard.writeText(`${text}\n\nRef: ${ref}`);
      trackEvent("share_result");
      recordShareDone();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback yok */
    }
  };

  return (
    <button type="button" onClick={copy} className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-xs text-zinc-300 hover:border-accent-dim">
      {copied ? "Kopyalandı ✓" : "Sonucu Paylaş"}
    </button>
  );
}

function buildShareText(result: PipelineResult): string {
  const top = result.countries.slice(0, 5);
  const lines = [
    "Eye Finder — Küresel İlgi Analizi",
    `Eye Score: ${result.eyeScore.eyeScore ?? "—"}/100`,
    "",
    "Top Ülkeler:",
    ...top.map(
      (c, i) =>
        `${i + 1}. ${c.compatibility.countryName} (${c.compatibility.affinity})`,
    ),
    "",
    "Bu bir eşleşme skoru değildir — tercih uyumu tahminidir.",
  ];
  return lines.join("\n");
}
