import type { EyeScoreResult } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { AFFINITY_WEIGHTS } from "@/lib/engines/country-affinity";
import { EYE_SCORE_WEIGHTS } from "@/lib/engines/eye-score";

interface Props {
  eyeScore: EyeScoreResult;
}

export function ScoreBreakdown({ eyeScore }: Props) {
  const subs = eyeScore.subScores;

  return (
    <Card title="Skor Nasıl Oluşuyor?">
      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase text-zinc-500">Eye Score</p>
        <div className="space-y-2">
          <WeightRow label="Fiziksel" value={subs.physical} weight={EYE_SCORE_WEIGHTS.physical} />
          <WeightRow label="Yaşam Tarzı" value={subs.lifestyle} weight={EYE_SCORE_WEIGHTS.lifestyle} />
          <WeightRow label="Sosyal (SVI)" value={subs.social} weight={EYE_SCORE_WEIGHTS.social} />
          <WeightRow label="Kişilik" value={subs.personality} weight={EYE_SCORE_WEIGHTS.personality} />
          <WeightRow label="Fotoğraf / Yüz" value={subs.photo} weight={EYE_SCORE_WEIGHTS.photo} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase text-zinc-500">Ülke Uyumu (Country Affinity)</p>
        <div className="space-y-2">
          <WeightRow label="Fiziksel uyum" weight={AFFINITY_WEIGHTS.physical} />
          <WeightRow label="Yaşam tarzı uyumu" weight={AFFINITY_WEIGHTS.lifestyle} />
          <WeightRow label="Kişilik uyumu" weight={AFFINITY_WEIGHTS.personality} />
          <WeightRow label="İlişki niyeti uyumu" weight={AFFINITY_WEIGHTS.relationship} />
          <WeightRow label="Sosyal uyum" weight={AFFINITY_WEIGHTS.social} />
        </div>
      </div>
    </Card>
  );
}

function WeightRow({
  label,
  value,
  weight,
}: {
  label: string;
  value?: number | null;
  weight: number;
}) {
  const contribution = value != null ? Math.round(value * weight) : null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">
        {label}{" "}
        <span className="text-zinc-600">× {(weight * 100).toFixed(0)}%</span>
      </span>
      <span className="font-mono text-accent">
        {contribution != null ? contribution : "—"}
      </span>
    </div>
  );
}
