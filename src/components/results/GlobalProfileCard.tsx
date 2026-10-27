"use client";

import type { PipelineResult, UserProfile } from "@/lib/types";
import { computeGlobalProfileType } from "@/lib/engines/profile-type";
import { GlassCard } from "@/components/ui/GlassCard";

interface Props {
  result: PipelineResult;
  profile: UserProfile;
}

export function GlobalProfileCard({ result, profile }: Props) {
  const type = computeGlobalProfileType(profile, result.eyeScore);

  return (
    <GlassCard title="Global Profil Tipin" subtitle="Archetype" glow>
      <div className="flex items-start gap-4">
        <span className="text-4xl">{type.emoji}</span>
        <div>
          <h3 className="text-lg font-bold text-white">{type.title}</h3>
          <p className="text-sm text-accent-soft">{type.tagline}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zinc-300">{type.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {type.traits.map((trait) => (
          <span
            key={trait}
            className="rounded-full border border-zinc-700/60 bg-zinc-900/60 px-3 py-1 text-[10px] text-zinc-400"
          >
            {trait}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
