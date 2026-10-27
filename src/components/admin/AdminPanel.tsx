"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { apiFetch } from "@/lib/api";

type Tab =
  | "overview"
  | "feedback"
  | "country"
  | "waitlist"
  | "users"
  | "tags"
  | "records"
  | "analytics"
  | "audit"
  | "announcements"
  | "maintenance";

interface DashboardData {
  feedback: { count: number; average: number };
  countryFeedback: { count: number; summary: { yes: number; partial: number; no: number } };
  waitlist: { count: number };
  analytics: { total: number; topEvents: Record<string, number> };
  users: { count: number; admins: number; tiers: { free: number; plus: number; pro: number } };
  signals: number;
  cloudUsers: number;
}

interface FeedbackItem {
  rating: number;
  comment?: string;
  ts: string;
}

interface CountryItem {
  countryCode: string;
  countryName: string;
  affinity: number;
  vote: "yes" | "partial" | "no";
  ts: string;
}

interface WaitlistItem {
  email: string;
  referralCode?: string;
  ts: string;
}

interface UserItem {
  id: string;
  email: string;
  tier: "free" | "plus" | "pro";
  tierExpiresAt: string | null;
  isAdmin: boolean;
  role: "user" | "admin";
  suspended: boolean;
  createdAt: string;
}

interface TagItem {
  id: string;
  name: string;
  color: string;
  description: string;
  archived: boolean;
  recordCount: number;
}

interface RecordItem {
  id: string;
  ownerId: string;
  ownerEmail: string | null;
  hasProfile: boolean;
  hasResult: boolean;
  updatedAt: string;
  tags: { id: string; name: string; color: string }[];
}

interface AuditItem {
  id: string;
  ts: string;
  actorEmail: string;
  action: string;
  targetType: "user" | "tag" | "record";
  targetId: string;
  details?: Record<string, string | number | boolean | null>;
}

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  status: "draft" | "published" | "archived";
  audience: "all" | "premium" | "free";
  publishAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  publishedAt: string | null;
}

const EMPTY_ANNOUNCEMENT = {
  title: "",
  body: "",
  audience: "all" as "all" | "premium" | "free",
  publishAt: "",
  expiresAt: "",
};

interface AnalyticsData {
  total: number;
  counts: Record<string, number>;
  recent: { name: string; props?: Record<string, string | number | boolean>; ts: string }[];
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Özet" },
  { id: "feedback", label: "Geri Bildirim" },
  { id: "country", label: "Ülke Oyları" },
  { id: "waitlist", label: "Waitlist" },
  { id: "users", label: "Kullanıcılar" },
  { id: "tags", label: "Etiketler" },
  { id: "records", label: "Kayıtlar" },
  { id: "analytics", label: "Analytics" },
  { id: "audit", label: "Denetim" },
  { id: "announcements", label: "Duyurular" },
  { id: "maintenance", label: "Bakım" },
];

function fmtDate(ts: string): string {
  try {
    return new Date(ts).toLocaleString("tr-TR");
  } catch {
    return ts;
  }
}

function voteLabel(v: "yes" | "partial" | "no"): string {
  if (v === "yes") return "Evet";
  if (v === "partial") return "Kısmen";
  return "Hayır";
}

export function AdminPanel({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [feedbackAvg, setFeedbackAvg] = useState(0);
  const [countryItems, setCountryItems] = useState<CountryItem[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [newTag, setNewTag] = useState({ name: "", color: "#6366f1", description: "" });
  const [recordQuery, setRecordQuery] = useState("");
  const [recordTagFilter, setRecordTagFilter] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [bulkTagId, setBulkTagId] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"" | "user" | "admin">("");
  const [userStatusFilter, setUserStatusFilter] = useState<"" | "active" | "suspended">("");
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [announcementForm, setAnnouncementForm] = useState(EMPTY_ANNOUNCEMENT);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 4000);
  };

  const loadDashboard = useCallback(async () => {
    const res = await apiFetch("/api/admin/dashboard");
    if (res.ok) setDashboard((await res.json()) as DashboardData);
  }, []);

  const loadFeedback = useCallback(async () => {
    const res = await apiFetch("/api/admin/feedback");
    if (res.ok) {
      const data = (await res.json()) as { items: FeedbackItem[]; average: number };
      setFeedback(data.items);
      setFeedbackAvg(data.average);
    }
  }, []);

  const loadCountry = useCallback(async () => {
    const res = await apiFetch("/api/admin/country-feedback");
    if (res.ok) {
      const data = (await res.json()) as { items: CountryItem[] };
      setCountryItems(data.items);
    }
  }, []);

  const loadWaitlist = useCallback(async () => {
    const res = await apiFetch("/api/admin/waitlist");
    if (res.ok) {
      const data = (await res.json()) as { items: WaitlistItem[] };
      setWaitlist(data.items);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await apiFetch("/api/admin/users");
    if (res.ok) {
      const data = (await res.json()) as { items: UserItem[] };
      setUsers(data.items);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    const res = await apiFetch("/api/admin/analytics");
    if (res.ok) setAnalytics((await res.json()) as AnalyticsData);
  }, []);

  const loadTags = useCallback(async () => {
    const res = await apiFetch("/api/admin/tags");
    if (res.ok) {
      const data = (await res.json()) as { items: TagItem[] };
      setTags(data.items);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    const res = await apiFetch("/api/admin/records");
    if (res.ok) {
      const data = (await res.json()) as { items: RecordItem[] };
      setRecords(data.items);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    const res = await apiFetch("/api/admin/audit?limit=200");
    if (res.ok) {
      const data = (await res.json()) as { items: AuditItem[] };
      setAuditItems(data.items);
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    const res = await apiFetch("/api/admin/announcements");
    if (res.ok) {
      const data = (await res.json()) as { items: AnnouncementItem[] };
      setAnnouncements(data.items);
    }
  }, []);

  const reloadTab = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview") await loadDashboard();
      if (tab === "feedback") await loadFeedback();
      if (tab === "country") await loadCountry();
      if (tab === "waitlist") await loadWaitlist();
      if (tab === "users") await loadUsers();
      if (tab === "analytics") await loadAnalytics();
      if (tab === "tags") await loadTags();
      if (tab === "records") {
        await loadTags();
        await loadRecords();
      }
      if (tab === "audit") await loadAudit();
      if (tab === "announcements") await loadAnnouncements();
    } finally {
      setLoading(false);
    }
  }, [
    tab,
    loadDashboard,
    loadFeedback,
    loadCountry,
    loadWaitlist,
    loadUsers,
    loadAnalytics,
    loadTags,
    loadRecords,
    loadAudit,
    loadAnnouncements,
  ]);

  useEffect(() => {
    void reloadTab();
  }, [reloadTab]);

  const saveAnnouncement = async () => {
    const payload = {
      title: announcementForm.title,
      body: announcementForm.body,
      audience: announcementForm.audience,
      publishAt: announcementForm.publishAt ? new Date(announcementForm.publishAt).toISOString() : null,
      expiresAt: announcementForm.expiresAt ? new Date(announcementForm.expiresAt).toISOString() : null,
    };
    const url = editingAnnouncementId
      ? `/api/admin/announcements/${editingAnnouncementId}`
      : "/api/admin/announcements";
    const res = await apiFetch(url, {
      method: editingAnnouncementId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      flash(editingAnnouncementId ? "Taslak güncellendi" : "Taslak kaydedildi");
      setAnnouncementForm(EMPTY_ANNOUNCEMENT);
      setEditingAnnouncementId(null);
      await loadAnnouncements();
    } else {
      flash(data.error ?? "Kaydedilemedi");
    }
  };

  const editAnnouncement = (a: AnnouncementItem) => {
    setEditingAnnouncementId(a.id);
    setAnnouncementForm({
      title: a.title,
      body: a.body,
      audience: a.audience,
      publishAt: a.publishAt ? a.publishAt.slice(0, 16) : "",
      expiresAt: a.expiresAt ? a.expiresAt.slice(0, 16) : "",
    });
  };

  const setAnnouncementStatus = async (id: string, action: "publish" | "archive") => {
    const res = await apiFetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) {
      flash(action === "publish" ? "Duyuru yayınlandı" : "Duyuru arşivlendi");
      await loadAnnouncements();
    } else {
      flash(data.error ?? "İşlem başarısız");
    }
  };

  const deleteFeedback = async (displayIndex: number) => {
    const originalIndex = feedback.length - 1 - displayIndex;
    const res = await apiFetch(`/api/admin/feedback?index=${originalIndex}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      flash("Geri bildirim silindi");
      await loadFeedback();
      await loadDashboard();
    } else {
      flash(data.error ?? "Silinemedi");
    }
  };

  const clearFeedback = async () => {
    if (!confirm("Tüm geri bildirimler silinsin mi?")) return;
    const res = await apiFetch("/api/admin/feedback?all=1", { method: "DELETE" });
    if (res.ok) {
      flash("Geri bildirimler temizlendi");
      await loadFeedback();
      await loadDashboard();
    }
  };

  const deleteCountryVote = async (displayIndex: number) => {
    const originalIndex = countryItems.length - 1 - displayIndex;
    const res = await apiFetch(`/api/admin/country-feedback?index=${originalIndex}`, {
      method: "DELETE",
    });
    if (res.ok) {
      flash("Oy silindi");
      await loadCountry();
      await loadDashboard();
    }
  };

  const clearCountryVotes = async () => {
    if (!confirm("Tüm ülke oyları silinsin mi?")) return;
    const res = await apiFetch("/api/admin/country-feedback?all=1", { method: "DELETE" });
    if (res.ok) {
      flash("Ülke oyları temizlendi");
      await loadCountry();
      await loadDashboard();
    }
  };

  const deleteWaitlistEmail = async (email: string) => {
    const res = await apiFetch(`/api/admin/waitlist?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      flash("Waitlist kaydı silindi");
      await loadWaitlist();
      await loadDashboard();
    }
  };

  const clearWaitlist = async () => {
    if (!confirm("Waitlist tamamen temizlensin mi?")) return;
    const res = await apiFetch("/api/admin/waitlist?all=1", { method: "DELETE" });
    if (res.ok) {
      flash("Waitlist temizlendi");
      await loadWaitlist();
      await loadDashboard();
    }
  };

  const updateUser = async (
    id: string,
    patch: { tier?: string; role?: string; suspended?: boolean },
    confirmText?: string,
  ) => {
    if (confirmText && !confirm(confirmText)) return;
    const res = await apiFetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) {
      flash("Kullanıcı güncellendi");
      await loadUsers();
      await loadDashboard();
    } else {
      flash(data.error ?? "Güncellenemedi");
    }
  };

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`${email} silinsin mi?`)) return;
    const res = await apiFetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      flash("Kullanıcı silindi");
      await loadUsers();
      await loadDashboard();
    } else {
      flash(data.error ?? "Silinemedi");
    }
  };

  const createTag = async () => {
    const res = await apiFetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTag),
    });
    const data = await res.json();
    if (res.ok) {
      flash("Etiket oluşturuldu");
      setNewTag({ name: "", color: "#6366f1", description: "" });
      await loadTags();
    } else {
      flash(data.error ?? "Oluşturulamadı");
    }
  };

  const patchTag = async (id: string, patch: { name?: string; archived?: boolean }) => {
    const res = await apiFetch(`/api/admin/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) {
      flash("Etiket güncellendi");
      await loadTags();
    } else {
      flash(data.error ?? "Güncellenemedi");
    }
  };

  const renameTag = async (tag: TagItem) => {
    const name = prompt("Yeni etiket adı", tag.name);
    if (!name || name.trim() === tag.name) return;
    await patchTag(tag.id, { name });
  };

  const deleteTagItem = async (tag: TagItem) => {
    if (!confirm(`"${tag.name}" etiketi silinsin mi? Kayıtlar silinmez, yalnızca etiket atamaları kaldırılır.`)) return;
    const res = await apiFetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      flash("Etiket silindi");
      await loadTags();
      await loadRecords();
    } else {
      flash(data.error ?? "Silinemedi");
    }
  };

  const changeRecordTags = async (
    recordIds: string[],
    tagId: string,
    action: "add" | "remove",
  ) => {
    const res = await apiFetch("/api/admin/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordIds, tagId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      flash(action === "add" ? "Etiket eklendi" : "Etiket kaldırıldı");
      setSelectedRecords([]);
      await loadRecords();
      await loadTags();
    } else {
      flash(data.error ?? "İşlem başarısız");
    }
  };

  const visibleRecords = records.filter(
    (r) =>
      (!recordTagFilter || r.tags.some((t) => t.id === recordTagFilter)) &&
      (!recordQuery.trim() ||
        (r.ownerEmail ?? "").toLowerCase().includes(recordQuery.trim().toLowerCase())),
  );
  const activeTags = tags.filter((t) => !t.archived);
  const visibleUsers = users.filter(
    (u) =>
      (!userQuery.trim() || u.email.toLowerCase().includes(userQuery.trim().toLowerCase())) &&
      (!userRoleFilter || u.role === userRoleFilter) &&
      (!userStatusFilter ||
        (userStatusFilter === "suspended" ? u.suspended : !u.suspended)),
  );

  const resetSignals = async () => {
    const res = await apiFetch("/api/reset", { method: "POST" });
    const data = await res.json();
    flash(data.message ?? (res.ok ? "Sinyaller sıfırlandı" : "Hata"));
    if (res.ok) await loadDashboard();
  };

  const clearAnalytics = async () => {
    if (!confirm("Analytics verisi silinsin mi?")) return;
    const res = await apiFetch("/api/admin/analytics", { method: "DELETE" });
    if (res.ok) {
      flash("Analytics sıfırlandı");
      await loadAnalytics();
      await loadDashboard();
    }
  };

  return (
    <div className="page-stack animate-fade-in pt-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label">Yönetim</p>
          <h1 className="text-xl font-bold text-white">Admin Paneli</h1>
          <p className="mt-1 text-xs text-zinc-500">{adminEmail}</p>
        </div>
        <button type="button" onClick={() => void reloadTab()} className="btn-ghost text-xs">
          {loading ? "Yükleniyor…" : "Yenile"}
        </button>
      </div>

      {msg && (
        <p className="rounded-xl border border-accent-border bg-accent/10 px-3 py-2 text-xs text-accent">
          {msg}
        </p>
      )}

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-accent text-white"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && dashboard && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Kullanıcı", value: dashboard.users.count },
              { label: "Geri bildirim", value: dashboard.feedback.count },
              { label: "Ülke oyu", value: dashboard.countryFeedback.count },
              { label: "Waitlist", value: dashboard.waitlist.count },
              { label: "Analytics", value: dashboard.analytics.total },
              { label: "Sinyaller", value: dashboard.signals },
              { label: "Bulut yedek", value: dashboard.cloudUsers },
              { label: "Ort. puan", value: dashboard.feedback.average || "—" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl bg-zinc-900/50 p-3">
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">{c.label}</p>
                <p className="text-lg font-bold text-white">{c.value}</p>
              </div>
            ))}
          </div>

          <GlassCard title="Plan dağılımı">
            <div className="flex flex-wrap gap-4 text-sm">
              <span>Free: {dashboard.users.tiers.free}</span>
              <span>Plus: {dashboard.users.tiers.plus}</span>
              <span>Pro: {dashboard.users.tiers.pro}</span>
              <span>Admin: {dashboard.users.admins}</span>
            </div>
          </GlassCard>

          <GlassCard title="Ülke oyu özeti">
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-400">Evet: {dashboard.countryFeedback.summary.yes}</span>
              <span className="text-amber-400">
                Kısmen: {dashboard.countryFeedback.summary.partial}
              </span>
              <span className="text-rose-400">Hayır: {dashboard.countryFeedback.summary.no}</span>
            </div>
          </GlassCard>

          <GlassCard title="Demo modu">
            <p className="mb-3 text-sm text-zinc-400">
              Demo analizi yalnızca admin hesaplarına açıktır.
            </p>
            <Link href="/demo" className="btn-primary inline-block text-sm">
              Demo Modunu Aç
            </Link>
          </GlassCard>
        </div>
      )}

      {tab === "feedback" && (
        <GlassCard
          title={`Geri Bildirim (${feedback.length})`}
          subtitle={feedbackAvg ? `Ortalama: ${feedbackAvg}/5` : "Henüz yok"}
        >
          {feedback.length > 0 && (
            <button type="button" onClick={() => void clearFeedback()} className="btn-ghost mb-3 text-xs text-rose-400">
              Tümünü temizle
            </button>
          )}
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {feedback.length === 0 && <p className="text-sm text-zinc-500">Kayıt yok.</p>}
            {feedback.map((f, i) => (
              <div key={`${f.ts}-${i}`} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {"★".repeat(f.rating)}
                      <span className="text-zinc-600">{"★".repeat(5 - f.rating)}</span>
                      <span className="ml-2 text-xs text-zinc-500">{fmtDate(f.ts)}</span>
                    </p>
                    {f.comment ? (
                      <p className="mt-2 text-sm text-zinc-300">{f.comment}</p>
                    ) : (
                      <p className="mt-1 text-xs italic text-zinc-600">Yorum yok</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteFeedback(i)}
                    className="shrink-0 text-xs text-rose-400 hover:underline"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === "country" && (
        <GlassCard title={`Ülke Oyları (${countryItems.length})`}>
          {countryItems.length > 0 && (
            <button type="button" onClick={() => void clearCountryVotes()} className="btn-ghost mb-3 text-xs text-rose-400">
              Tümünü temizle
            </button>
          )}
          <div className="max-h-[420px] overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 pr-2">Ülke</th>
                  <th className="py-2 pr-2">Oy</th>
                  <th className="py-2 pr-2">Uyum</th>
                  <th className="py-2 pr-2">Tarih</th>
                  <th className="py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {countryItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-zinc-500">
                      Kayıt yok.
                    </td>
                  </tr>
                )}
                {countryItems.map((c, i) => (
                  <tr key={`${c.ts}-${i}`} className="border-b border-zinc-900">
                    <td className="py-2 pr-2 text-white">
                      {c.countryName}{" "}
                      <span className="text-zinc-600">({c.countryCode})</span>
                    </td>
                    <td className="py-2 pr-2">{voteLabel(c.vote)}</td>
                    <td className="py-2 pr-2">{c.affinity}%</td>
                    <td className="py-2 pr-2 text-zinc-500">{fmtDate(c.ts)}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => void deleteCountryVote(i)}
                        className="text-rose-400 hover:underline"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {tab === "waitlist" && (
        <GlassCard title={`Beta Waitlist (${waitlist.length})`}>
          {waitlist.length > 0 && (
            <button type="button" onClick={() => void clearWaitlist()} className="btn-ghost mb-3 text-xs text-rose-400">
              Tümünü temizle
            </button>
          )}
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {waitlist.length === 0 && <p className="text-sm text-zinc-500">Kayıt yok.</p>}
            {waitlist.map((w) => (
              <div
                key={w.email}
                className="flex items-center justify-between rounded-xl bg-zinc-900/40 px-3 py-2"
              >
                <div>
                  <p className="text-sm text-white">{w.email}</p>
                  <p className="text-[10px] text-zinc-500">
                    {fmtDate(w.ts)}
                    {w.referralCode ? ` · ref: ${w.referralCode}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteWaitlistEmail(w.email)}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === "users" && (
        <GlassCard title={`Kullanıcılar (${visibleUsers.length} / ${users.length})`}>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="E-posta ara"
              aria-label="E-posta ara"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
            />
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value as "" | "user" | "admin")}
              aria-label="Role göre filtrele"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
            >
              <option value="">Tüm roller</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value as "" | "active" | "suspended")}
              aria-label="Duruma göre filtrele"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
            >
              <option value="">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="suspended">Askıda</option>
            </select>
          </div>
          <div className="max-h-[480px] overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 pr-2">E-posta</th>
                  <th className="py-2 pr-2">Plan</th>
                  <th className="py-2 pr-2">Rol</th>
                  <th className="py-2 pr-2">Kayıt</th>
                  <th className="py-2 pr-2">Durum</th>
                  <th className="py-2">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-zinc-500">
                      Eşleşen kullanıcı yok.
                    </td>
                  </tr>
                )}
                {visibleUsers.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-900">
                    <td className="py-2 pr-2 text-white">{u.email}</td>
                    <td className="py-2 pr-2">
                      <select
                        value={u.tier}
                        onChange={(e) => void updateUser(u.id, { tier: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
                      >
                        <option value="free">free</option>
                        <option value="plus">plus</option>
                        <option value="pro">pro</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          void updateUser(
                            u.id,
                            { role: e.target.value },
                            `${u.email} hesabının rolü "${e.target.value}" olarak değiştirilsin mi?`,
                          )
                        }
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2 text-zinc-500">{fmtDate(u.createdAt)}</td>
                    <td className="py-2 pr-2">
                      <button
                        type="button"
                        onClick={() =>
                          void updateUser(
                            u.id,
                            { suspended: !u.suspended },
                            u.suspended
                              ? `${u.email} hesabı etkinleştirilsin mi?`
                              : `${u.email} hesabı askıya alınsın mı?`,
                          )
                        }
                        className={u.suspended ? "text-emerald-400 hover:underline" : "text-amber-400 hover:underline"}
                      >
                        {u.suspended ? "Askıda · Etkinleştir" : "Aktif · Askıya al"}
                      </button>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => void deleteUser(u.id, u.email)}
                        className="text-rose-400 hover:underline"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {tab === "analytics" && analytics && (
        <div className="space-y-4">
          <GlassCard title={`Olay sayıları (${analytics.total})`}>
            {analytics.total > 0 && (
              <button type="button" onClick={() => void clearAnalytics()} className="btn-ghost mb-3 text-xs text-rose-400">
                Analytics sıfırla
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              {Object.entries(analytics.counts)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <span
                    key={name}
                    className="rounded-full bg-zinc-900/60 px-2 py-1 text-xs text-zinc-300"
                  >
                    {name}: {count}
                  </span>
                ))}
              {analytics.total === 0 && <p className="text-sm text-zinc-500">Kayıt yok.</p>}
            </div>
          </GlassCard>

          <GlassCard title="Son 100 olay">
            <div className="max-h-[320px] space-y-1 overflow-y-auto font-mono text-[10px] text-zinc-400">
              {analytics.recent.map((e, i) => (
                <div key={`${e.ts}-${i}`} className="border-b border-zinc-900 py-1">
                  <span className="text-accent">{e.name}</span> · {fmtDate(e.ts)}
                  {e.props && Object.keys(e.props).length > 0 && (
                    <span className="text-zinc-600"> · {JSON.stringify(e.props)}</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "tags" && (
        <div className="space-y-4">
          <GlassCard title="Yeni etiket">
            <div className="flex flex-wrap items-end gap-2 text-xs">
              <input
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Etiket adı"
                maxLength={40}
                aria-label="Etiket adı"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
              />
              <input
                type="color"
                value={newTag.color}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                aria-label="Etiket rengi"
                className="h-7 w-10 rounded"
              />
              <input
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                placeholder="Açıklama (isteğe bağlı)"
                maxLength={200}
                aria-label="Etiket açıklaması"
                className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
              />
              <button
                type="button"
                onClick={() => void createTag()}
                disabled={!newTag.name.trim()}
                className="btn-primary text-xs"
              >
                Ekle
              </button>
            </div>
          </GlassCard>

          <GlassCard title={`Etiketler (${tags.length})`}>
            {tags.length === 0 && <p className="text-sm text-zinc-500">Henüz etiket yok.</p>}
            <div className="max-h-[480px] overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <tbody>
                  {tags.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-900">
                      <td className="py-2 pr-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: t.color }}
                          aria-hidden="true"
                        />
                      </td>
                      <td className="py-2 pr-2 text-white">
                        {t.name}
                        {t.archived && <span className="ml-2 text-zinc-500">(arşiv)</span>}
                      </td>
                      <td className="py-2 pr-2 text-zinc-500">{t.description}</td>
                      <td className="py-2 pr-2 text-zinc-400">{t.recordCount} kayıt</td>
                      <td className="space-x-3 py-2 text-right">
                        <button type="button" onClick={() => void renameTag(t)} className="text-accent hover:underline">
                          Yeniden adlandır
                        </button>
                        <button
                          type="button"
                          onClick={() => void patchTag(t.id, { archived: !t.archived })}
                          className="text-zinc-300 hover:underline"
                        >
                          {t.archived ? "Geri al" : "Arşivle"}
                        </button>
                        <button type="button" onClick={() => void deleteTagItem(t)} className="text-rose-400 hover:underline">
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "records" && (
        <GlassCard title={`Kayıtlar (${visibleRecords.length} / ${records.length})`}>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <input
              value={recordQuery}
              onChange={(e) => setRecordQuery(e.target.value)}
              placeholder="Sahip e-postası ara"
              aria-label="Sahip e-postası ara"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
            />
            <select
              value={recordTagFilter}
              onChange={(e) => setRecordTagFilter(e.target.value)}
              aria-label="Etikete göre filtrele"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
            >
              <option value="">Tüm etiketler</option>
              {activeTags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500">{selectedRecords.length} seçili</span>
            <select
              value={bulkTagId}
              onChange={(e) => setBulkTagId(e.target.value)}
              aria-label="Toplu işlem etiketi"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-white"
            >
              <option value="">Etiket seç</option>
              {activeTags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedRecords.length || !bulkTagId}
              onClick={() => void changeRecordTags(selectedRecords, bulkTagId, "add")}
              className="btn-secondary text-xs"
            >
              Seçilenlere ekle
            </button>
            <button
              type="button"
              disabled={!selectedRecords.length || !bulkTagId}
              onClick={() => void changeRecordTags(selectedRecords, bulkTagId, "remove")}
              className="btn-ghost text-xs"
            >
              Seçilenlerden kaldır
            </button>
          </div>

          {records.length === 0 && <p className="text-sm text-zinc-500">Henüz kayıt yok.</p>}
          <div className="max-h-[480px] overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 pr-2">
                    <input
                      type="checkbox"
                      aria-label="Görünen kayıtların tümünü seç"
                      checked={visibleRecords.length > 0 && visibleRecords.every((r) => selectedRecords.includes(r.id))}
                      onChange={(e) =>
                        setSelectedRecords(e.target.checked ? visibleRecords.map((r) => r.id) : [])
                      }
                    />
                  </th>
                  <th className="py-2 pr-2">Sahip</th>
                  <th className="py-2 pr-2">Profil / Sonuç</th>
                  <th className="py-2 pr-2">Güncellenme</th>
                  <th className="py-2">Etiketler</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-900">
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        aria-label={`${r.ownerEmail ?? r.id} kaydını seç`}
                        checked={selectedRecords.includes(r.id)}
                        onChange={(e) =>
                          setSelectedRecords((prev) =>
                            e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id),
                          )
                        }
                      />
                    </td>
                    <td className="py-2 pr-2 text-white">{r.ownerEmail ?? r.ownerId}</td>
                    <td className="py-2 pr-2 text-zinc-400">
                      {r.hasProfile ? "Profil" : "—"} / {r.hasResult ? "Sonuç" : "—"}
                    </td>
                    <td className="py-2 pr-2 text-zinc-500">{fmtDate(r.updatedAt)}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {r.tags.map((t) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-200"
                          >
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: t.color }}
                              aria-hidden="true"
                            />
                            {t.name}
                            <button
                              type="button"
                              aria-label={`${t.name} etiketini kaldır`}
                              onClick={() => void changeRecordTags([r.id], t.id, "remove")}
                              className="text-zinc-500 hover:text-rose-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {tab === "audit" && (
        <GlassCard title={`Denetim kayıtları (${auditItems.length})`}>
          {auditItems.length === 0 && <p className="text-sm text-zinc-500">Henüz işlem yok.</p>}
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-2 pr-2">Zaman</th>
                  <th className="py-2 pr-2">Yönetici</th>
                  <th className="py-2 pr-2">İşlem</th>
                  <th className="py-2 pr-2">Hedef</th>
                  <th className="py-2">Detay</th>
                </tr>
              </thead>
              <tbody>
                {auditItems.map((a) => (
                  <tr key={a.id} className="border-b border-zinc-900 align-top">
                    <td className="py-2 pr-2 text-zinc-500">{fmtDate(a.ts)}</td>
                    <td className="py-2 pr-2 text-white">{a.actorEmail}</td>
                    <td className="py-2 pr-2 text-accent">{a.action}</td>
                    <td className="py-2 pr-2 text-zinc-400">
                      {a.targetType}: {a.targetId}
                    </td>
                    <td className="py-2 font-mono text-[10px] text-zinc-500">
                      {a.details ? JSON.stringify(a.details) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {tab === "announcements" && (
        <div className="space-y-4">
          <GlassCard title={editingAnnouncementId ? "Taslağı düzenle" : "Yeni duyuru taslağı"}>
            <div className="grid gap-2">
              <input
                className="input"
                placeholder="Başlık (en fazla 120 karakter)"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              />
              <textarea
                className="input min-h-[96px]"
                placeholder="İçerik (en fazla 2000 karakter)"
                value={announcementForm.body}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
              />
              <select
                className="input"
                value={announcementForm.audience}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    audience: e.target.value as "all" | "premium" | "free",
                  })
                }
              >
                <option value="all">Tüm kullanıcılar</option>
                <option value="premium">Premium üyeler</option>
                <option value="free">Ücretsiz kullanıcılar</option>
              </select>
              <label className="text-xs text-zinc-400">
                Yayın tarihi (boş = hemen)
                <input
                  type="datetime-local"
                  className="input mt-1"
                  value={announcementForm.publishAt}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, publishAt: e.target.value })}
                />
              </label>
              <label className="text-xs text-zinc-400">
                Bitiş tarihi (boş = süresiz)
                <input
                  type="datetime-local"
                  className="input mt-1"
                  value={announcementForm.expiresAt}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                />
              </label>
              <div className="rounded-xl border border-zinc-800 p-3 text-sm">
                <p className="mb-1 text-xs text-zinc-500">Önizleme</p>
                <p className="font-semibold text-white">{announcementForm.title || "Başlık"}</p>
                <p className="whitespace-pre-wrap text-zinc-300">{announcementForm.body || "İçerik"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-primary text-sm"
                  disabled={!announcementForm.title.trim() || !announcementForm.body.trim()}
                  onClick={() => void saveAnnouncement()}
                >
                  {editingAnnouncementId ? "Taslağı güncelle" : "Taslak olarak kaydet"}
                </button>
                {editingAnnouncementId && (
                  <button
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() => {
                      setEditingAnnouncementId(null);
                      setAnnouncementForm(EMPTY_ANNOUNCEMENT);
                    }}
                  >
                    Vazgeç
                  </button>
                )}
              </div>
            </div>
          </GlassCard>

          <GlassCard title={`Duyurular (${announcements.length})`}>
            {announcements.length === 0 && <p className="text-sm text-zinc-500">Henüz duyuru yok.</p>}
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="rounded-xl border border-zinc-800 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">{a.title}</p>
                    <span className="text-xs text-accent">{a.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Hedef: {a.audience} · Yayın: {a.publishAt ? fmtDate(a.publishAt) : "hemen"} · Bitiş:{" "}
                    {a.expiresAt ? fmtDate(a.expiresAt) : "yok"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {a.status === "draft" && (
                      <>
                        <button type="button" className="btn-secondary text-xs" onClick={() => editAnnouncement(a)}>
                          Düzenle
                        </button>
                        <button
                          type="button"
                          className="btn-primary text-xs"
                          onClick={() => void setAnnouncementStatus(a.id, "publish")}
                        >
                          Yayınla
                        </button>
                      </>
                    )}
                    {a.status === "published" && (
                      <button
                        type="button"
                        className="btn-ghost text-xs text-rose-400"
                        onClick={() => void setAnnouncementStatus(a.id, "archive")}
                      >
                        Arşivle
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}

      {tab === "maintenance" && (
        <div className="space-y-4">
          <GlassCard title="Sunucu bakımı">
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => void resetSignals()} className="btn-secondary">
                Global sinyalleri sıfırla
              </button>
              <button type="button" onClick={() => void clearAnalytics()} className="btn-secondary">
                Analytics verisini sıfırla
              </button>
            </div>
          </GlassCard>

          <GlassCard title="Veri temizliği">
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => void clearFeedback()} className="btn-ghost text-sm text-rose-400">
                Geri bildirimleri temizle
              </button>
              <button type="button" onClick={() => void clearCountryVotes()} className="btn-ghost text-sm text-rose-400">
                Ülke oylarını temizle
              </button>
              <button type="button" onClick={() => void clearWaitlist()} className="btn-ghost text-sm text-rose-400">
                Waitlist temizle
              </button>
            </div>
          </GlassCard>

          <GlassCard title="Hızlı erişim">
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/demo" className="btn-primary text-center text-sm">
                Demo Modu
              </Link>
              <Link href="/beta" className="btn-secondary text-center text-sm">
                Beta Sayfası
              </Link>
              <Link href="/settings" className="btn-secondary text-center text-sm">
                Ayarlar
              </Link>
              <Link href="/account" className="btn-ghost text-center text-sm">
                Hesabım
              </Link>
            </div>
          </GlassCard>
        </div>
      )}

      <Link href="/account" className="btn-ghost text-center text-sm">
        Hesaba dön
      </Link>
    </div>
  );
}
