"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await apiFetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setBusy(false);
    setMsg((data.message as string) ?? (data.error as string));
  };

  return (
    <div className="page-stack mx-auto max-w-md animate-fade-in pt-6">
      <PageHeader title="Şifremi unuttum" subtitle="E-posta adresine sıfırlama kodu oluşturulur" />
      <GlassCard>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="section-label mb-2 block">E-posta</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {msg && <p className="text-sm text-zinc-300">{msg}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            Kod oluştur
          </button>
        </form>
      </GlassCard>
      <Link href="/welcome" className="btn-ghost text-center text-sm">
        Giriş sayfasına dön
      </Link>
    </div>
  );
}
