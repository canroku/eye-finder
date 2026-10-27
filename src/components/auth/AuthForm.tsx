"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { EyeLogoMark } from "@/components/ui/EyeLogo";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const { login, register, continueAsGuest, user } = useAuth();
  const [mode, setMode] = useState<Mode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && !user.isGuest) router.replace("/plans");
  }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const err = mode === "register" ? await register(email, password) : await login(email, password);
      if (err) {
        setError(err);
        return;
      }
      router.push("/plans");
    } catch {
      setError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  const guest = async () => {
    setBusy(true);
    setError(null);
    try {
      await continueAsGuest();
      router.push("/plans");
    } catch {
      setError("Misafir girişi şu an yapılamıyor. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-panel animate-slide-up">
      <div className="mb-8">
        <EyeLogoMark size="md" />
        <h1 className="mt-5 text-xl font-semibold text-white">Hesabınla devam et</h1>
        <p className="mt-2 text-sm text-secondary">
          Analiz sonuçlarını kaydet, Plus ve Pro rehberlerine eriş.
        </p>
      </div>

      <div className="segmented mb-6">
        {(["register", "login"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`segmented-item ${mode === m ? "segmented-item-active" : ""}`}
          >
            {m === "register" ? "Kayıt ol" : "Giriş yap"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="auth-email" className="section-label mb-2 block">
            E-posta
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="ornek@mail.com"
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="section-label mb-2 block">
            Şifre
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="En az 6 karakter"
          />
        </div>
        {error && <p className="alert-error rounded-xl px-3 py-2 text-sm">{error}</p>}
        {mode === "login" && (
          <Link href="/forgot-password" className="block text-center text-xs text-accent hover:underline">
            Şifremi unuttum
          </Link>
        )}
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Bekleyin…" : mode === "register" ? "Hesap oluştur" : "Giriş yap"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase tracking-widest text-muted">veya</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button type="button" disabled={busy} onClick={guest} className="btn-secondary">
        Misafir olarak dene
      </button>
      <p className="mt-3 text-center text-[11px] text-muted">Misafir modunda yalnızca Free özellikler açılır.</p>
    </div>
  );
}
