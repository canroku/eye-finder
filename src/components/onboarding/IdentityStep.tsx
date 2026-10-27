"use client";

import type { Gender, InterestedIn, UserProfile } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { genderLabel, interestedInLabel } from "@/lib/engines/archetype-generator";

interface Props {
  profile: Partial<UserProfile>;
  onChange: (patch: Partial<UserProfile>) => void;
  onNext: () => void;
}

const GENDER_OPTIONS: { value: Gender; emoji: string }[] = [
  { value: "male", emoji: "👨" },
  { value: "female", emoji: "👩" },
  { value: "non_binary", emoji: "🧑" },
  { value: "other", emoji: "✨" },
];

const INTEREST_OPTIONS: { value: InterestedIn; emoji: string }[] = [
  { value: "women", emoji: "👩" },
  { value: "men", emoji: "👨" },
  { value: "both", emoji: "👫" },
  { value: "all", emoji: "🌈" },
];

export function IdentityStep({ profile, onChange, onNext }: Props) {
  const identity = profile.identity!;

  const setIdentity = (patch: Partial<typeof identity>) => {
    onChange({ identity: { ...identity, ...patch } });
  };

  const canProceed = identity.gender && identity.interestedIn;

  return (
    <Card title="Kendini Tanıt">
      <p className="mb-6 text-sm text-zinc-400">
        Bu bilgiler analiz ve ülke bazlı profil arketiplerini kişiselleştirmek için
        kullanılır.
      </p>

      <div className="space-y-8">
        <section>
          <h4 className="mb-3 text-sm font-medium text-zinc-300">Cinsiyetin</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GENDER_OPTIONS.map(({ value, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setIdentity({ gender: value })}
                className={`choice-btn ${identity.gender === value ? "choice-btn-active" : ""}`}
              >
                <span className="text-2xl">{emoji}</span>
                <span>{genderLabel(value)}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-sm font-medium text-zinc-300">
            İlgilendiğin cinsiyet
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {INTEREST_OPTIONS.map(({ value, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setIdentity({ interestedIn: value })}
                className={`choice-btn ${identity.interestedIn === value ? "choice-btn-active" : ""}`}
              >
                <span className="text-2xl">{emoji}</span>
                <span>{interestedInLabel(value)}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-sm font-medium text-zinc-300">Tercih ettiğin yaş aralığı</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-xs text-zinc-500">Min</span>
              <input
                type="number"
                min={18}
                max={identity.agePreferenceMax}
                value={identity.agePreferenceMin}
                onChange={(e) =>
                  setIdentity({ agePreferenceMin: Number(e.target.value) })
                }
                className="input"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-zinc-500">Max</span>
              <input
                type="number"
                min={identity.agePreferenceMin}
                max={70}
                value={identity.agePreferenceMax}
                onChange={(e) =>
                  setIdentity({ agePreferenceMax: Number(e.target.value) })
                }
                className="input"
              />
            </label>
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-sm font-medium text-zinc-300">Kısa tanıtım (opsiyonel)</h4>
          <textarea
            value={identity.bio}
            onChange={(e) => setIdentity({ bio: e.target.value })}
            placeholder="Kendini birkaç cümleyle anlat..."
            rows={3}
            className="input resize-none"
          />
        </section>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onNext} disabled={!canProceed} className="btn-primary disabled:opacity-40">
          Devam Et
        </button>
      </div>
    </Card>
  );
}
