"use client";

import type { UserProfile } from "@/lib/types";
import { Card } from "@/components/ui/Card";

interface Props {
  profile: Partial<UserProfile>;
  onChange: (patch: Partial<UserProfile>) => void;
  onNext: () => void;
}

export function ConsentStep({ profile, onChange, onNext }: Props) {
  const consent = profile.consent!;

  const setConsent = (patch: Partial<typeof consent>) => {
    onChange({
      consent: {
        ...consent,
        ...patch,
        acceptedAt: new Date().toISOString(),
      },
    });
  };

  const allAccepted =
    consent.ageConfirmed &&
    consent.dataProcessingAccepted &&
    consent.photoAnalysisAccepted &&
    consent.archetypeDisclaimerAccepted;

  return (
    <Card title="Gizlilik & Onay">
      <p className="mb-6 text-sm leading-relaxed text-zinc-400">
        Eye Finder bir eşleştirme uygulaması değildir. Profil analizi yapılır; verilerin
        cihazında (IndexedDB) saklanır. Fotoğraflar yüz analizi için işlenir.
      </p>

      <div className="space-y-4">
        <ConsentCheck
          checked={consent.ageConfirmed}
          onChange={(v) => setConsent({ ageConfirmed: v })}
          label="18 yaşından büyük olduğumu onaylıyorum"
        />
        <ConsentCheck
          checked={consent.dataProcessingAccepted}
          onChange={(v) => setConsent({ dataProcessingAccepted: v })}
          label="Profil verilerimin analiz amacıyla işlenmesini kabul ediyorum (KVKK bilgilendirme)"
        />
        <ConsentCheck
          checked={consent.photoAnalysisAccepted}
          onChange={(v) => setConsent({ photoAnalysisAccepted: v })}
          label="Fotoğraflarımın yüz analizi (landmark, simetri, ifade) için işlenmesini kabul ediyorum"
        />
        <ConsentCheck
          checked={consent.archetypeDisclaimerAccepted}
          onChange={(v) => setConsent({ archetypeDisclaimerAccepted: v })}
          label="Ülke arketiplerinin gerçek kişiler değil, kültürel tercih modelleri olduğunu anlıyorum"
        />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-xs text-zinc-500">
        Verilerinizi istediğiniz zaman Sonuçlar sayfasından silebilirsiniz. Skorlar
        tercih uyumu tahminidir; güzellik veya değer yargısı değildir.
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!allAccepted}
          className="btn-primary disabled:opacity-40"
        >
          Kabul Et & Devam
        </button>
      </div>
    </Card>
  );
}

function ConsentCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 p-4 transition hover:border-zinc-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-control"
      />
      <span className="text-sm text-zinc-200">{label}</span>
    </label>
  );
}
