"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setToken(q.get("token") ?? "");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await apiFetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setBusy(false);
    setMsg((data.message as string) ?? (data.error as string) ?? "İşlem tamam");
  };

  return (
    <div className="page-stack mx-auto max-w-md animate-fade-in pt-6">
      <PageHeader title="Yeni şifre" subtitle="Sıfırlama kodunu gir" />
      <GlassCard>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="section-label mb-2 block">Sıfırlama kodu</label>
            <input className="input" value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <div>
            <label className="section-label mb-2 block">Yeni şifre</label>
            <input
              type="password"
              className="input"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {msg && <p className="text-sm text-accent">{msg}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            Şifreyi güncelle
          </button>
        </form>
      </GlassCard>
      <Link href="/welcome" className="btn-ghost text-center text-sm">
        Giriş sayfasına dön
      </Link>
    </div>
  );
}
