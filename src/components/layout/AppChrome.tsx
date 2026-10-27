"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppHeaderBar } from "@/components/ui/AppHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { PremiumMesh } from "@/components/ui/PremiumMesh";
import { useAuth } from "@/contexts/AuthProvider";
import { hasSeenIntroLocally } from "@/lib/intro/complete-intro";
import { IS_LOCAL_ONLY } from "@/lib/api";

const AUTH_LAYOUT = ["/welcome", "/intro"];

/**
 * Statik (GitHub Pages / APK) build'de middleware çalışmaz; intro ve karşılama
 * yönlendirmelerini burada, middleware ile aynı kurallarla uygularız.
 */
function useStaticIntroGate(path: string) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!IS_LOCAL_ONLY || loading || user) return;
    if (path.startsWith("/intro")) return;

    const needsIntro =
      path === "/" ||
      path === "/welcome" ||
      path.startsWith("/onboarding") ||
      path.startsWith("/results");

    if (!hasSeenIntroLocally() && needsIntro) {
      const suffix =
        path !== "/" && path !== "/welcome" ? `?next=${encodeURIComponent(path)}` : "";
      router.replace(`/intro${suffix}`);
      return;
    }
    if (path === "/") {
      router.replace("/welcome");
      return;
    }
    if (path.startsWith("/onboarding") || path.startsWith("/results")) {
      router.replace(`/welcome?next=${encodeURIComponent(path)}`);
    }
  }, [path, user, loading, router]);
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  useStaticIntroGate(path);
  const isAuthLayout = AUTH_LAYOUT.some((r) => path.startsWith(r));

  if (isAuthLayout) {
    return (
      <div className="app-shell-auth">
        <PremiumMesh />
        {children}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <PremiumMesh />
      <AppHeaderBar />
      <main className="app-main">{children}</main>
      <BottomNav />
    </div>
  );
}
