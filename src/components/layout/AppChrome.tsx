"use client";

import { usePathname } from "next/navigation";
import { AppHeaderBar } from "@/components/ui/AppHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { PremiumMesh } from "@/components/ui/PremiumMesh";

const AUTH_LAYOUT = ["/welcome", "/intro"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
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
