"use client";

import type { PipelineResult } from "@/lib/types";
import { getMyReferralCode } from "@/lib/referral";
import { trackEvent } from "@/lib/analytics";

interface Props {
  result: PipelineResult;
}

export function ShareCard({ result }: Props) {
  const score = result.eyeScore.eyeScore ?? 0;
  const top = result.countries.slice(0, 3);
  const ref = getMyReferralCode();

  const download = async () => {
    trackEvent("share_result", { score });
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#f59e0b";

    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, 600, 400);
    ctx.fillStyle = accent;
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("Eye Finder", 32, 48);
    ctx.fillStyle = "#fafafa";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText(`${score}`, 32, 120);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("Eye Score / 100", 32, 148);
    ctx.fillStyle = "#e4e4e7";
    ctx.font = "18px sans-serif";
    top.forEach((c, i) => {
      ctx.fillText(
        `${i + 1}. ${c.compatibility.countryName} — ${c.compatibility.affinity}`,
        32,
        200 + i * 36,
      );
    });
    ctx.fillStyle = "#71717a";
    ctx.font = "12px sans-serif";
    ctx.fillText(`Ref: ${ref} · Eşleşme değil, uyum tahmini`, 32, 370);

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "eye-finder-share.png";
    a.click();
  };

  return (
    <button
      type="button"
      onClick={download}
      className="rounded-xl border border-accent-dim bg-accent-dim px-4 py-2 text-xs text-accent-soft hover:bg-accent-dim-strong"
    >
      Paylaşım Kartı İndir
    </button>
  );
}
