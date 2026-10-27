import type { UserProfile, PhotoStyleTag } from "@/lib/types";

export interface StyleCvResult {
  dominantStyle: PhotoStyleTag;
  confidence: number;
  tags: PhotoStyleTag[];
  summary: string;
}

const STYLE_FROM_APPEARANCE: Record<string, PhotoStyleTag> = {
  formal: "formal",
  casual: "casual",
  sport: "sport",
  street: "street",
};

/** Profil ve foto meta verisinden stil vektörü — hafif CV proxy */
export function analyzeStyleFromProfile(profile: UserProfile): StyleCvResult {
  const reported = profile.appearance?.clothingStyle;
  const fromReport = reported ? STYLE_FROM_APPEARANCE[reported] : undefined;

  const photoTags = profile.photos.map((p) => p.styleTag).filter(Boolean);
  const counts: Record<PhotoStyleTag, number> = {
    formal: 0,
    casual: 0,
    sport: 0,
    street: 0,
  };
  photoTags.forEach((t) => {
    counts[t] = (counts[t] ?? 0) + 1;
  });
  if (fromReport) counts[fromReport] += 2;

  const sorted = (Object.entries(counts) as [PhotoStyleTag, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const dominant = sorted[0]?.[0] ?? "casual";
  const total = sorted.reduce((s, [, n]) => s + n, 0) || 1;
  const confidence = Math.round((sorted[0]?.[1] ?? 0) / total * 100);

  const tags = sorted.filter(([, n]) => n > 0).map(([t]) => t);

  const labels: Record<PhotoStyleTag, string> = {
    formal: "Resmi / şık",
    casual: "Gündelik",
    sport: "Spor",
    street: "Streetwear",
  };

  return {
    dominantStyle: dominant,
    confidence,
    tags: tags.length ? tags : [dominant],
    summary: `Baskın stil: ${labels[dominant]} (${confidence}% güven)`,
  };
}
