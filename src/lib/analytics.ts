"use client";

import { apiFetch } from "@/lib/api";

type EventName =
  | "onboarding_start"
  | "onboarding_complete"
  | "pipeline_error"
  | "demo_launch"
  | "feedback_submit"
  | "share_result"
  | "reset_system"
  | "premium_view";

interface AnalyticsEvent {
  name: EventName;
  props?: Record<string, string | number | boolean>;
  ts: string;
}

const KEY = "eye-finder-analytics";

export function trackEvent(name: EventName, props?: AnalyticsEvent["props"]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.push({ name, props, ts: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(events.slice(-500)));
  } catch {
    /* ignore */
  }

  void apiFetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, props }),
  }).catch(() => {});
}

export function getLocalEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as AnalyticsEvent[];
  } catch {
    return [];
  }
}
