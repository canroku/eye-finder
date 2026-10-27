"use client";

import { useState } from "react";
import { apiPost } from "@/lib/errors";
import { trackEvent } from "@/lib/analytics";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (rating < 1) return;
    setLoading(true);
    setError(null);
    try {
      await apiPost("/api/feedback", {
        rating,
        comment,
        ts: new Date().toISOString(),
      });
      trackEvent("feedback_submit", { rating });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Geri bildirim gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <p className="text-sm text-emerald-400">Teşekkürler — geri bildirimin kaydedildi.</p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <p className="text-sm text-zinc-400">Sonuçlar ne kadar isabetli?</p>
      <div className="flex gap-2" role="group" aria-label="Puan">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`h-10 w-10 rounded-lg border text-sm ${
              rating >= n
                ? "border-accent bg-accent-dim text-accent-soft"
                : "border-zinc-700 text-zinc-500"
            }`}
            aria-pressed={rating >= n}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="İsteğe bağlı yorum…"
        rows={3}
        className="input"
      />
      <button
        type="button"
        disabled={rating < 1 || loading}
        onClick={submit}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {loading ? "Gönderiliyor…" : "Gönder"}
      </button>
    </div>
  );
}
