import type { PipelineResult, UserProfile } from "@/lib/types";
import { computeGlobalProfileType } from "@/lib/engines/profile-type";
import { getMyReferralCode } from "@/lib/referral";
import { APP_VERSION, BETA_LABEL } from "@/lib/version";

function themeAccent(): string {
  if (typeof document === "undefined") return "#f59e0b";
  return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#f59e0b";
}

export function renderReportCanvas(
  result: PipelineResult,
  profile: UserProfile | null,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const accent = themeAccent();
  const score = result.eyeScore.eyeScore ?? 0;
  const profileType = profile ? computeGlobalProfileType(profile, result.eyeScore) : null;
  const top = result.countries.slice(0, 8);

  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, 800, 1100);

  ctx.fillStyle = accent;
  ctx.font = "bold 32px system-ui, sans-serif";
  ctx.fillText("Eye Finder", 40, 56);

  ctx.fillStyle = "#71717a";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(`${BETA_LABEL} v${APP_VERSION} · Küresel İlgi Raporu`, 40, 82);

  ctx.fillStyle = "#fafafa";
  ctx.font = "bold 72px system-ui, sans-serif";
  ctx.fillText(String(score), 40, 170);
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "18px system-ui, sans-serif";
  ctx.fillText("Global Eye Score / 100", 40, 200);

  let y = 250;

  if (profileType) {
    ctx.fillStyle = accent;
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText(`${profileType.emoji} ${profileType.title}`, 40, y);
    y += 28;
    ctx.fillStyle = "#d4d4d8";
    ctx.font = "15px system-ui, sans-serif";
    wrapText(ctx, profileType.summary, 40, y, 720, 22);
    y += 88;
  }

  ctx.fillStyle = accent;
  ctx.font = "bold 18px system-ui, sans-serif";
  ctx.fillText("Top Ülkeler", 40, y);
  y += 32;

  ctx.font = "16px system-ui, sans-serif";
  top.forEach((c, i) => {
    ctx.fillStyle = "#e4e4e7";
    ctx.fillText(
      `${i + 1}. ${c.compatibility.countryName} — ${c.compatibility.affinity}`,
      40,
      y,
    );
    y += 28;
  });

  y += 16;
  const subs = result.eyeScore.subScores ?? {};
  ctx.fillStyle = accent;
  ctx.font = "bold 18px system-ui, sans-serif";
  ctx.fillText("Alt Skorlar", 40, y);
  y += 32;
  ctx.fillStyle = "#d4d4d8";
  ctx.font = "15px system-ui, sans-serif";
  [
    ["Physical", subs.physical],
    ["Lifestyle", subs.lifestyle],
    ["Social", subs.social],
    ["Personality", subs.personality],
    ["Photo", subs.photo],
  ].forEach(([label, val]) => {
    ctx.fillText(`${label}: ${val ?? "—"}`, 40, y);
    y += 24;
  });

  y += 20;
  ctx.fillStyle = "#52525b";
  ctx.font = "12px system-ui, sans-serif";
  wrapText(
    ctx,
    "Bu bir eşleşme skoru değildir — küresel tercih uyumu tahminidir. eye-finder.local",
    40,
    y,
    720,
    18,
  );
  ctx.fillText(`Ref: ${getMyReferralCode()}`, 40, 1060);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cy);
}

export function downloadReportPng(result: PipelineResult, profile: UserProfile | null): void {
  const canvas = renderReportCanvas(result, profile);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `eye-finder-rapor-${Date.now()}.png`;
  a.click();
}

export function downloadReportPdf(result: PipelineResult, profile: UserProfile | null): void {
  const canvas = renderReportCanvas(result, profile);
  const win = window.open("", "_blank");
  if (!win) {
    downloadReportPng(result, profile);
    return;
  }
  const img = canvas.toDataURL("image/png");
  win.document.write(`
    <!DOCTYPE html><html><head><title>Eye Finder Rapor</title>
    <style>body{margin:0;display:flex;justify-content:center;background:#111}
    img{max-width:100%;height:auto}@media print{body{background:#fff}}</style></head>
    <body><img src="${img}" onload="window.print();window.close()" /></body></html>
  `);
  win.document.close();
}
