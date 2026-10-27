"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PrivacyPage() {
  return (
    <div className="page-stack animate-fade-in pt-2">
      <PageHeader
        label="Yasal"
        title="KVKK & Gizlilik"
        subtitle="Kişisel verilerin nasıl işlendiğine dair özet bilgilendirme"
      />

      <GlassCard title="Veri sorumlusu" subtitle="Eye Finder Beta">
        <p className="text-sm text-zinc-400">
          Eye Finder; profil, fotoğraf analizi metadatası, kişilik yanıtları ve analiz sonuçlarını
          yalnızca küresel uyum analizi sunmak için işler. Veriler eşleştirme veya kişi tanıma
          amacıyla kullanılmaz.
        </p>
      </GlassCard>

      <GlassCard title="Toplanan veriler">
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• Kimlik ve demografi (yaş, şehir, tercihler)</li>
          <li>• Yaşam tarzı ve kişilik anketi yanıtları</li>
          <li>• Fotoğraflardan türetilen yüz analizi skorları (ham fotoğraf sunucuda tutulmaz)</li>
          <li>• Analiz sonuçları ve geri bildirimler (isteğe bağlı)</li>
        </ul>
      </GlassCard>

      <GlassCard title="Saklama">
        <p className="text-sm text-zinc-400">
          Kayıtlı hesaplarda profil/sonuç sunucuda yedeklenir. Misafir modunda veriler yalnızca
          cihazında kalır. İstediğin zaman Ayarlar → Sistemi Tamamen Sıfırla ile silebilirsin.
        </p>
      </GlassCard>

      <GlassCard title="Hakların">
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• Verilerine erişim ve silme (uygulama içi sıfırlama)</li>
          <li>• İşleme itirazı — onboarding onayını geri çekerek yeni analiz yapmama</li>
          <li>• Şikâyet — beta döneminde geri bildirim formu üzerinden iletişim</li>
        </ul>
      </GlassCard>

      <GlassCard title="İletişim">
        <p className="text-sm text-zinc-400">
          Soruların için Ayarlar → Geri Bildirim veya{" "}
          <span className="text-accent">privacy@eye-finder.local</span> (beta placeholder).
        </p>
      </GlassCard>

      <Link href="/settings" className="btn-secondary text-center">
        Ayarlara dön
      </Link>
    </div>
  );
}
