"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAccount,
  IconAnalyze,
  IconHome,
  IconJourney,
  IconResults,
} from "@/components/ui/NavIcons";

const TABS = [
  { href: "/", label: "Keşfet", Icon: IconHome },
  { href: "/journey", label: "Yolculuk", Icon: IconJourney },
  { href: "/onboarding", label: "Analiz", Icon: IconAnalyze, center: true },
  { href: "/results", label: "Sonuç", Icon: IconResults },
  { href: "/account", label: "Hesap", Icon: IconAccount },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Ana menü">
      <div className="bottom-nav-inner">
        {TABS.map(({ href, label, Icon, center }) => {
          const active =
            path === href ||
            (href === "/onboarding" && path.startsWith("/onboarding")) ||
            (href === "/journey" && path.startsWith("/journey"));
          return (
            <Link
              key={href}
              href={href}
              className={`tab-link ${active ? "tab-link-active" : ""} ${center ? "tab-link-center" : ""}`}
            >
              <span className="tab-icon">
                <Icon className={center ? "h-6 w-6" : "h-5 w-5"} />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
