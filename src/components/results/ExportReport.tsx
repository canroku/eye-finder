"use client";

import type { PipelineResult, UserProfile } from "@/lib/types";
import { downloadReportPdf, downloadReportPng } from "@/lib/export-report";
import { trackEvent } from "@/lib/analytics";
import { useSubscription } from "@/hooks/useSubscription";
import Link from "next/link";

interface Props {
  result: PipelineResult;
  profile: UserProfile | null;
}

export function ExportReport({ result, profile }: Props) {
  const { limits } = useSubscription();

  const png = () => {
    if (!limits.exportPng) return;
    downloadReportPng(result, profile);
    trackEvent("share_result", { format: "png_full" });
  };

  const pdf = () => {
    if (!limits.exportPdf) return;
    downloadReportPdf(result, profile);
    trackEvent("share_result", { format: "pdf" });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {limits.exportPng ? (
        <button
          type="button"
          onClick={png}
          className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300 hover:border-accent-dim"
        >
          Rapor PNG
        </button>
      ) : (
        <Link href="/plans" className="rounded-xl border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-500">
          PNG — Plus+
        </Link>
      )}
      {limits.exportPdf ? (
        <button
          type="button"
          onClick={pdf}
          className="rounded-xl border border-accent-dim bg-accent-dim px-3 py-2 text-xs text-accent-soft hover:bg-accent-dim-strong"
        >
          Rapor PDF
        </button>
      ) : (
        <Link href="/plans" className="rounded-xl border border-dashed border-violet-500/30 px-3 py-2 text-xs text-violet-300/80">
          PDF — Pro
        </Link>
      )}
    </div>
  );
}
