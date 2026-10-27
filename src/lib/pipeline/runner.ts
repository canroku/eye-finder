import type { PipelineResult, UserProfile } from "@/lib/types";
import { runPipeline, type PipelineOptions } from "@/lib/pipeline";
import { withTimeout } from "@/lib/utils/timeout";

export type PipelineStage =
  | "prepare"
  | "analyze"
  | "countries"
  | "save"
  | "done";

export interface PipelineRunOptions extends PipelineOptions {
  onStage?: (stage: PipelineStage, detail?: string) => void;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 90_000;

export async function runPipelineSafe(
  profile: UserProfile,
  options: PipelineRunOptions = {},
): Promise<PipelineResult> {
  const { onStage, timeoutMs = DEFAULT_TIMEOUT_MS, maxCountries, mode } = options;

  onStage?.("prepare", "Profil doğrulanıyor");
  onStage?.("analyze", "Skor motorları çalışıyor");

  const result = await withTimeout(
    runPipeline(profile, { maxCountries, mode }),
    timeoutMs,
    "Analiz pipeline",
  );

  onStage?.("countries", `${result.countries.length} ülke hesaplandı`);
  onStage?.("done");

  return result;
}
