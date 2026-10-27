"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { EyeLogoMark } from "@/components/ui/EyeLogo";
import { IconGlobe, IconHeart, IconSpark } from "@/components/ui/NavIcons";

export default function WelcomePage() {
  return (
    <>
      <aside className="auth-brand">
        <div>
          <EyeLogoMark size="lg" />
          <h1 className="auth-brand-title">
            Dünyada nerede
            <br />
            <span className="gradient-text">ilgi</span> görürsün?
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-secondary">
            Eye Finder; profilini, tercihlerini ve kültürel uyumunu analiz ederek hangi
            ülkelerde daha güçlü bir çekim oluşturabileceğini gösterir.
          </p>
        </div>
        <ul className="space-y-4 text-sm text-secondary">
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-dim text-accent">
              <IconGlobe className="h-4 w-4" />
            </span>
            Free — hızlı keşif analizi
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-dim text-accent">
              <IconHeart className="h-4 w-4" />
            </span>
            Plus — ülke uyum rehberi
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-dim text-accent">
              <IconSpark className="h-4 w-4" />
            </span>
            Pro — tanışma aksiyon planı
          </li>
        </ul>
      </aside>
      <main className="auth-main">
        <AuthForm />
      </main>
    </>
  );
}
