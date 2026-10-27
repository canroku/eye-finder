"use client";

import Link from "next/link";
import { APP_VERSION, BETA_LABEL } from "@/lib/version";

export function BetaBadge({ linked = true }: { linked?: boolean }) {
  const badge = (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent-dim bg-accent-dim px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-soft">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
      {BETA_LABEL} v{APP_VERSION}
    </span>
  );

  if (linked) {
    return (
      <Link href="/beta" className="hover:opacity-80" title="Beta sürüm notları">
        {badge}
      </Link>
    );
  }

  return badge;
}
