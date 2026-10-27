import type { CountryResult, PipelineResult, UserProfile } from "@/lib/types";
import { COUNTRY_MATRIX } from "@/lib/data/country-matrix";
import { getAppsForCountry } from "@/lib/data/country-apps";
import { generateArchetypes } from "@/lib/engines/archetype-generator";

export function normalizeCountryResult(
  partial: Partial<CountryResult> & { compatibility: CountryResult["compatibility"] },
  profile?: UserProfile | null,
): CountryResult {
  const code = partial.compatibility.countryCode;
  const country =
    COUNTRY_MATRIX.find((c) => c.code === code) ?? COUNTRY_MATRIX[0];

  return {
    compatibility: partial.compatibility,
    reasons: partial.reasons ?? [],
    apps: getAppsForCountry(code),
    archetypes:
      partial.archetypes ??
      (profile?.identity
        ? generateArchetypes(profile, country, partial.compatibility.affinity)
        : []),
  };
}

export function normalizePipelineResult(
  result: PipelineResult,
  profile?: UserProfile | null,
): PipelineResult {
  if (!result?.eyeScore) return result;

  return {
    ...result,
    signalCount: result.signalCount ?? 0,
    learningActive: result.learningActive ?? false,
    countries: (result.countries ?? []).map((c) => normalizeCountryResult(c, profile)),
  };
}
