"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { SliderField } from "@/components/ui/SliderField";
import { SOCIAL_PRESETS, type SocialPresetId } from "@/lib/engines/profile-validation";

interface Props {
  profile: Partial<UserProfile>;
  onChange: (patch: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SocialStep({ profile, onChange, onNext, onBack }: Props) {
  const [customize, setCustomize] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<SocialPresetId | null>(null);
  const intent = profile.relationshipIntent!;
  const tags = profile.socialTags!;
  const appearance = profile.appearance!;

  const applyPreset = (id: SocialPresetId) => {
    setSelectedPreset(id);
    onChange({ socialTags: SOCIAL_PRESETS[id].tags });
  };

  return (
    <div className="space-y-6">
      <Card title="İlişki Tercihleri">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["marriage", "Evlilik düşünüyor"],
              ["longTerm", "Uzun ilişki"],
              ["shortTerm", "Kısa ilişki"],
              ["friendship", "Arkadaşlık"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 p-4 hover:border-zinc-600"
            >
              <input
                type="checkbox"
                checked={intent[key]}
                onChange={(e) =>
                  onChange({
                    relationshipIntent: { ...intent, [key]: e.target.checked },
                  })
                }
                className="h-4 w-4 accent-control"
              />
              <span className="text-zinc-200">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card title="Sosyal Tipin">
        <p className="mb-4 text-sm text-zinc-400">Bir preset seç — hızlı ve yeterli.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.entries(SOCIAL_PRESETS) as [SocialPresetId, typeof SOCIAL_PRESETS.social_butterfly][]).map(
            ([id, preset]) => (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedPreset === id
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
            <SliderField label="Dışa dönük" value={tags.extrovert} onChange={(v) => onChange({ socialTags: { ...tags, extrovert: v } })} />
            <SliderField label="Sosyal" value={tags.social} onChange={(v) => onChange({ socialTags: { ...tags, social: v } })} />
            <SliderField label="Maceracı" value={tags.adventurous} onChange={(v) => onChange({ socialTags: { ...tags, adventurous: v } })} />
            <SliderField label="Sakin" value={tags.quiet} onChange={(v) => onChange({ socialTags: { ...tags, quiet: v } })} />
          </div>
        )}
      </Card>

      <Card title="Dış Görünüş">
        <div className="grid gap-4 sm:grid-cols-2">
          <Toggle label="Sakal" checked={appearance.hasBeard} onChange={(v) => onChange({ appearance: { ...appearance, hasBeard: v } })} />
          <Toggle label="Dövme" checked={appearance.hasTattoo} onChange={(v) => onChange({ appearance: { ...appearance, hasTattoo: v } })} />
          <Toggle label="Sigara" checked={appearance.smokes} onChange={(v) => onChange({ appearance: { ...appearance, smokes: v } })} />
          <Toggle label="Alkol" checked={appearance.drinksAlcohol} onChange={(v) => onChange({ appearance: { ...appearance, drinksAlcohol: v } })} />
          <SelectField label="Saç" value={appearance.hairLength} options={[["short","Kısa"],["medium","Orta"],["long","Uzun"],["bald","Kel"]]} onChange={(v) => onChange({ appearance: { ...appearance, hairLength: v as typeof appearance.hairLength } })} />
          <SelectField label="Giyim" value={appearance.clothingStyle} options={[["formal","Formal"],["casual","Günlük"],["sport","Spor"],["street","Sokak"]]} onChange={(v) => onChange({ appearance: { ...appearance, clothingStyle: v as typeof appearance.clothingStyle } })} />
        </div>
      </Card>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">Geri</button>
        <button type="button" onClick={onNext} className="btn-primary">Devam Et</button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 p-4">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-control" />
      <span className="text-zinc-200">{label}</span>
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: [string,string][]; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </label>
  );
}
