"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { EyeLogoMark } from "@/components/ui/EyeLogo";
import { TierBadge } from "@/components/plans/TierBadge";
import { useAuth } from "@/contexts/AuthProvider";
import { loadResult, RESET_EVENT } from "@/lib/storage";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const DESKTOP_NAV = [
  { href: "/", label: "Keşfet" },
  { href: "/journey", label: "Yolculuk" },
  { href: "/onboarding", label: "Analiz" },
  { href: "/results", label: "Sonuçlar" },
  { href: "/plans", label: "Planlar" },
  { href: "/account", label: "Hesap" },
];

export function AppHeaderBar() {
  const path = usePathname();
  const { tier } = useAuth();
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const load = () => {
      loadResult().then((result) => setScore(result?.eyeScore.eyeScore ?? null));
    };
    load();
    window.addEventListener(RESET_EVENT, load);
    return () => window.removeEventListener(RESET_EVENT, load);
  }, [path]);

  return (
    <header className="app-header">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 lg:max-w-5xl">
        <Link href="/" className="min-w-0 shrink-0">
          <EyeLogoMark size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {DESKTOP_NAV.map(({ href, label }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-accent-dim font-medium text-accent-soft"
                    : "text-secondary hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <TierBadge tier={tier} />
          <NotificationBell />
          {score !== null && (
            <div className="stat-pill tabular-nums text-xs">{score}</div>
          )}
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-border bg-accent-dim text-accent lg:hidden"
            aria-label="Hesap"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
