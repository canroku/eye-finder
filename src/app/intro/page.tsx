"use client";

import { Suspense } from "react";
import { AppIntro } from "@/components/intro/AppIntro";

function IntroFallback() {
  return (
    <div className="intro-shell flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-dim border-t-accent" />
    </div>
  );
}

export default function IntroPage() {
  return (
    <Suspense fallback={<IntroFallback />}>
      <AppIntro />
    </Suspense>
  );
}
