"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeLogoMark } from "@/components/ui/EyeLogo";
import { IconGlobe, IconHeart, IconSpark } from "@/components/ui/NavIcons";
import { markIntroComplete } from "@/lib/intro/complete-intro";
import { COUNTRY_COUNT } from "@/lib/data/country-matrix";

const SLIDES = [
  {
    id: "welcome",
    icon: null as null,
    title: "Eye Finder",
    highlight: "Küresel ilgi analizi",
    body: "Profilini, tercihlerini ve kültürel uyumunu analiz ederek hangi ülkelerde daha güçlü bir çekim oluşturabileceğini keşfet.",
  },
  {
    id: "countries",
    icon: IconGlobe,
    title: `${COUNTRY_COUNT} ülke`,
    highlight: "Kültürel uyum haritası",
    body: "Her ülke için uyum skoru, küme analizi ve kişiselleştirilmiş içgörüler — tek ekranda.",
  },
  {
    id: "score",
    icon: IconHeart,
    title: "Eye Score",
    highlight: "Profil gücünü ölç",
    body: "Fotoğraf, yaşam tarzı ve tercihlerinden türetilen skor; en uyumlu ülkeleri ve tanışma potansiyelini netleştirir.",
  },
  {
    id: "start",
    icon: IconSpark,
    title: "Hazırsın",
    highlight: "Yolculuğa başla",
    body: "Ücretsiz analizle başla; Plus ve Pro ile ülke rehberleri, aksiyon planları ve global ulaşım ipuçlarına eriş.",
  },
] as const;

export function AppIntro() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [index, setIndex] = useState(0);

  const slide = SLIDES[index]!;
  const isLast = index === SLIDES.length - 1;
  const Icon = slide.icon;

  const finish = useCallback(() => {
    markIntroComplete();
    const next = searchParams.get("next");
    router.replace(next && next.startsWith("/") ? next : "/welcome");
  }, [router, searchParams]);

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div className="intro-shell">
      <header className="intro-header">
        <EyeLogoMark size="sm" />
        {!isLast && (
          <button type="button" onClick={finish} className="intro-skip">
            Atla
          </button>
        )}
      </header>

      <div className="intro-body" key={slide.id}>
        <div className="intro-visual">
          {Icon ? (
            <span className="intro-icon-ring">
              <Icon className="h-10 w-10 text-accent" />
            </span>
          ) : (
            <div className="intro-logo-pulse">
              <EyeLogoMark size="lg" />
            </div>
          )}
        </div>

        <p className="section-label text-center">{slide.title}</p>
        <h1 className="intro-title">
          <span className="gradient-text">{slide.highlight}</span>
        </h1>
        <p className="intro-copy">{slide.body}</p>
      </div>

      <footer className="intro-footer">
        <div className="intro-dots" role="tablist" aria-label="Intro adımları">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Adım ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`intro-dot ${i === index ? "intro-dot-active" : ""}`}
            />
          ))}
        </div>

        <button type="button" onClick={next} className="btn-primary intro-cta">
          {isLast ? "Başla" : "Devam"}
        </button>
      </footer>
    </div>
  );
}
