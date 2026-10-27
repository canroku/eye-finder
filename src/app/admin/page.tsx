"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function AdminPage() {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return (
      <div className="page-stack pt-4">
        <PageHeader title="Yetkisiz" subtitle="Bu sayfa yalnızca admin hesapları içindir." />
        <Link href="/" className="btn-secondary text-center">
          Ana sayfa
        </Link>
      </div>
    );
  }

  return <AdminPanel adminEmail={user.email} />;
}
