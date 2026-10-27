"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { SliderField } from "@/components/ui/SliderField";
import { LIFESTYLE_PRESETS, type LifestylePresetId } from "@/lib/engines/profile-validation";

interface Props {
  profile: Partial<UserProfile>;
  onChange: (patch: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function LifestyleStep({ profile, onChange, onNext, onBack }: Props) {
  const [customize, setCustomize] = useState(false);
  const [selected, setSelected] = useState<LifestylePresetId | null>(null);
  const lifestyle = profile.lifestyle!;

  const applyPreset = (id: LifestylePresetId) => {
    setSelected(id);
    onChange({ lifestyle: LIFESTYLE_PRESETS[id].values });
  };

  return (
    <Card title="Yaşam Tarzı">
      <p className="mb-4 text-sm text-zinc-400">
        Bir yaşam tarzı seç — ülke karşılaştırmasında kullanılır.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.entries(LIFESTYLE_PRESETS) as [LifestylePresetId, typeof LIFESTYLE_PRESETS.active][]).map(
          ([id, preset]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected === id
                  ? "border-accent bg-accent-dim"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <span className="text-2xl">{preset.emoji}</span>
              <p className="mt-1 font-medium text-white">{preset.label}</p>
              <p className="text-xs text-zinc-500">{preset.desc}</p>
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => setCustomize(!customize)}
        className="mt-4 text-sm text-accent hover:underline"
      >
        {customize ? "Preset görünümüne dön" : "İnce ayar (opsiyonel)"}
      </button>

      {customize && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["sport", "Spor"],
              ["travel", "Seyahat"],
              ["books", "Kitap"],
              ["nightlife", "Gece Hayatı"],
              ["technology", "Teknoloji"],
              ["art", "Sanat"],
            ] as const
          ).map(([key, label]) => (
            <SliderField
              key={key}
              label={label}
              value={lifestyle[key]}
              onChange={(v) => onChange({ lifestyle: { ...lifestyle, [key]: v } })}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">Geri</button>
        <button type="button" onClick={onNext} className="btn-primary">
          Devam Et
        </button>
      </div>
    </Card>
  );
}
