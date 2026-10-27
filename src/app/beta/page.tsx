"use client";

import { BetaBadge } from "@/components/ui/BetaBadge";
import { ChangelogPanel } from "@/components/beta/ChangelogPanel";
import { WaitlistForm } from "@/components/beta/WaitlistForm";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export default function BetaPage() {
  return (
    <div className="animate-fade-in space-y-5 pb-8 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="section-label">Lansman</p>
          <h1 className="text-xl font-bold text-white">Eye Finder Beta</h1>
        </div>
        <BetaBadge linked={false} />
      </div>

      <GlassCard title="Beta Waitlist" subtitle="Erken erişim" glow>
        <p className="mb-4 text-sm text-zinc-400">
          v0.2 Beta bugün yayında. Waitlist&apos;e katıl — yeni özelliklerden ilk sen haberdar ol.
        </p>
        <WaitlistForm />
      </GlassCard>

      <GlassCard title="Hızlı Başlangıç" subtitle="3 adım">
        <ol className="space-y-3 text-sm text-zinc-400">
          <li className="flex gap-3">
            <span className="font-mono text-accent">1</span>
            <span>
              <Link href="/onboarding" className="text-accent hover:underline">Profil oluştur</Link> ve analiz yap (min 1 foto)
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-accent">2</span>
            <span>
              <Link href="/results" className="text-accent hover:underline">Sonuçları</Link> incele ve ülkeleri keşfet
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-accent">3</span>
            <span>Sonuçları paylaş, ülke geri bildirimi ver</span>
          </li>
        </ol>
      </GlassCard>

      <GlassCard title="Sürüm Notları" subtitle="Changelog">
        <ChangelogPanel />
      </GlassCard>
    </div>
  );
}
