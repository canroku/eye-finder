"use client";

import type { UserProfile } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import {
  COUNTRY_OPTIONS,
  EDUCATION_OPTIONS,
  INCOME_OPTIONS,
  LANGUAGE_OPTIONS,
  PROFESSION_OPTIONS,
} from "@/lib/data/form-options";

interface Props {
  profile: Partial<UserProfile>;
  onChange: (patch: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DemographicsStep({ profile, onChange, onNext, onBack }: Props) {
  const d = profile.demographics!;

  const setDemographics = (patch: Partial<typeof d>) => {
    onChange({ demographics: { ...d, ...patch } });
  };

  const toggleLanguage = (lang: string) => {
    const langs = d.languages.includes(lang)
      ? d.languages.filter((l) => l !== lang)
      : [...d.languages, lang];
    setDemographics({ languages: langs.length ? langs : [lang] });
  };

  return (
    <Card title="Demografik Bilgiler">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Yaş">
          <input
            type="number"
            min={18}
            max={80}
            value={d.age}
            onChange={(e) => setDemographics({ age: Number(e.target.value) })}
            className="input"
          />
        </Field>
        <Field label="Boy (cm)">
          <input
            type="number"
            min={140}
            max={220}
            value={d.height}
            onChange={(e) => setDemographics({ height: Number(e.target.value) })}
            className="input"
          />
        </Field>
        <Field label="Kilo (kg)">
          <input
            type="number"
            min={40}
            max={200}
            value={d.weight}
            onChange={(e) => setDemographics({ weight: Number(e.target.value) })}
            className="input"
          />
        </Field>
        <Field label="Ülke">
          <select
            value={d.country}
            onChange={(e) => setDemographics({ country: e.target.value })}
            className="input"
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Şehir">
          <input
            type="text"
            value={d.city}
            onChange={(e) => setDemographics({ city: e.target.value })}
            className="input"
            placeholder="İstanbul"
          />
        </Field>
        <Field label="Eğitim">
          <select
            value={d.education}
            onChange={(e) =>
              setDemographics({
                education: e.target.value as typeof d.education,
              })
            }
            className="input"
          >
            {EDUCATION_OPTIONS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Meslek">
          <select
            value={d.profession}
            onChange={(e) => setDemographics({ profession: e.target.value })}
            className="input"
          >
            {PROFESSION_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Gelir Aralığı">
          <select
            value={d.incomeBand}
            onChange={(e) =>
              setDemographics({
                incomeBand: e.target.value as typeof d.incomeBand,
              })
            }
            className="input"
          >
            {INCOME_OPTIONS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm text-zinc-400">Konuştuğu Diller</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                d.languages.includes(lang)
                  ? "bg-accent text-black"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary">
          Geri
        </button>
        <button type="button" onClick={onNext} className="btn-primary">
          Devam Et
        </button>
      </div>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
