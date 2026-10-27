"use client";

import { useState } from "react";
import { apiPost } from "@/lib/errors";
import { getMyReferralCode } from "@/lib/referral";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { trackEvent } from "@/lib/analytics";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refCode = getMyReferralCode();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Geçerli bir e-posta gir.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiPost("/api/waitlist", {
        email,
        referralCode: refCode,
        ts: new Date().toISOString(),
      });
      trackEvent("onboarding_start", { type: "waitlist" });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        Beta listesine eklendin. Davet kodun: <strong>{refCode}</strong>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresin"
        className="input"
        required
      />
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Kaydediliyor…" : "Beta Waitlist'e Katıl"}
      </button>
      <p className="text-[10px] text-zinc-600">
        Davet kodun: {refCode} — arkadaşlarınla paylaş.
      </p>
    </form>
  );
}
