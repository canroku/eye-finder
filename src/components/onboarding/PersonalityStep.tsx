"use client";

import { useMemo, useState } from "react";
import type { PersonalityAnswer, UserProfile } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { getQuestionsForMode, type OnboardingMode } from "@/lib/data/personality-questions";

interface Props {
  profile: Partial<UserProfile>;
  onChange: (patch: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  mode?: OnboardingMode;
}

const LIKERT = [
  { value: 20, label: "Kesinlikle hayır", emoji: "👎" },
  { value: 40, label: "Hayır", emoji: "👎🏻" },
  { value: 60, label: "Kararsız", emoji: "🤷" },
  { value: 80, label: "Evet", emoji: "👍" },
  { value: 100, label: "Kesinlikle evet", emoji: "👍🏻" },
];

export function PersonalityStep({ profile, onChange, onNext, onBack, mode = "standard" }: Props) {
  const questions = getQuestionsForMode(mode);
  const [currentRaw, setCurrent] = useState(0);
  // Mode can change while this step is mounted (e.g. deep → quick), so clamp the index.
  const current = Math.min(currentRaw, questions.length - 1);
  const answers = profile.personalityAnswers ?? [];
  const answerMap = useMemo(
    () => new Map(answers.map((a) => [a.questionId, a.value])),
    [answers],
  );

  const question = questions[current];
  const progress = answers.length / questions.length;
  const allDone = answers.length >= questions.length;

  const setAnswer = (questionId: string, value: number) => {
    const filtered = answers.filter((a) => a.questionId !== questionId);
    onChange({ personalityAnswers: [...filtered, { questionId, value }] });

    if (current < questions.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 200);
    }
  };

  const traitColors: Record<string, string> = {
    extraversion: "text-blue-400",
    openness: "text-purple-400",
    agreeableness: "text-pink-400",
    conscientiousness: "text-green-400",
    emotional_stability: "text-cyan-400",
  };

  return (
    <Card title="Hızlı Kişilik Testi">
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-zinc-400">
            Soru {current + 1} / {questions.length}
          </span>
          <span className="text-accent">%{Math.round(progress * 100)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-2 flex gap-1 overflow-x-auto pb-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 shrink-0 rounded-full transition ${
              answerMap.has(q.id)
                ? "bg-emerald-500"
                : i === current
                  ? "bg-accent"
                  : "bg-zinc-700"
            }`}
            aria-label={`Soru ${i + 1}`}
          />
        ))}
      </div>

      <div className="animate-slide-up rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <span className={`text-xs uppercase tracking-widest ${traitColors[question.trait]}`}>
          {question.trait.replace("_", " ")}
        </span>
        <p className="mt-4 text-xl font-medium leading-relaxed text-white">
          {question.text}
        </p>

        <div className="mt-8 grid gap-2 sm:grid-cols-5">
          {LIKERT.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAnswer(question.id, value)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
                answerMap.get(question.id) === value
                  ? "border-accent bg-accent-dim-strong text-accent-soft"
                  : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800"
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-[10px] leading-tight text-zinc-400">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-40"
        >
          ← Önceki
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
          disabled={current >= questions.length - 1}
          className="btn-secondary disabled:opacity-40"
        >
          Sonraki →
        </button>
      </div>

      <div className="mt-8 flex justify-between border-t border-zinc-800 pt-6">
        <button type="button" onClick={onBack} className="btn-secondary">
          Geri
        </button>
        <button type="button" onClick={onNext} disabled={!allDone} className="btn-primary disabled:opacity-40">
          Devam Et ({answers.length}/{questions.length})
        </button>
      </div>
    </Card>
  );
}
