import type { PipelineResult, UserProfile } from "@/lib/types";
import { idbDestroy, idbDelete, idbGet, idbResetStore, idbSet, closeDB } from "@/lib/storage/idb";
import { resetIdbQueue } from "@/lib/storage/idb-queue";
import { apiFetch } from "@/lib/api";
import { normalizePipelineResult } from "@/lib/normalize-result";
import { pushUserDataToCloud, pullUserDataFromCloud } from "@/lib/storage/cloud-sync";
import { ENGAGEMENT_EVENT } from "@/lib/engagement/types";
import {
  stripDraftForStorage,
  stripLegacyJsonPhotos,
  stripPhotosForStorage,
} from "@/lib/utils/profile-storage";

export const RESET_EVENT = "eye-finder-reset";
const STORAGE_PREFIX = "eye-finder";

const KEYS = {
  profile: "profile",
  result: "result",
  draft: "draft",
  signals: "signals",
  matrixDeltas: "matrix-deltas",
  migrated: "migrated-v1",
} as const;

const LS_KEYS = {
  profile: "eye-finder-profile",
  result: "eye-finder-result",
  signals: "eye-finder-global-signals",
};

export const LEARNING_THRESHOLD = 100;

export async function mergeCloudDataIntoLocal(): Promise<void> {
  const cloud = await pullUserDataFromCloud();
  if (!cloud) return;
  if (cloud.profile) await idbSet(KEYS.profile, cloud.profile);
  if (cloud.result) await idbSet(KEYS.result, cloud.result);
}

export interface GlobalInterestSignal {
  region: string;
  likedTraits: string[];
  timestamp: string;
  topCountry?: string;
}

export interface MatrixDeltas {
  [countryCode: string]: Record<string, number>;
}

function clearBrowserStorage(): void {
  if (typeof window === "undefined") return;

  for (const store of [localStorage, sessionStorage]) {
    for (let i = store.length - 1; i >= 0; i--) {
      const key = store.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        store.removeItem(key);
      }
    }
  }

  Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event(ENGAGEMENT_EVENT));
}

function notifyReset(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RESET_EVENT));
}

async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const done = await idbGet<boolean>(KEYS.migrated);
    if (done) return;

    const legacyProfile = localStorage.getItem(LS_KEYS.profile);
    const legacyResult = localStorage.getItem(LS_KEYS.result);
    const legacySignals = localStorage.getItem(LS_KEYS.signals);

    if (legacyProfile) {
      const stripped = stripLegacyJsonPhotos(legacyProfile);
      if (stripped) await idbSet(KEYS.profile, stripped);
    }
    if (legacyResult) await idbSet(KEYS.result, JSON.parse(legacyResult));
    if (legacySignals) await idbSet(KEYS.signals, JSON.parse(legacySignals));

    localStorage.removeItem(LS_KEYS.profile);
    localStorage.removeItem(LS_KEYS.result);
    localStorage.removeItem(LS_KEYS.signals);
    await idbSet(KEYS.migrated, true);
  } catch {
    /* bozuk legacy — devam et */
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await migrateFromLocalStorage();
  const stored = stripPhotosForStorage(profile);
  await idbSet(KEYS.profile, stored);
  await idbDelete(KEYS.draft);
  void pushUserDataToCloud({ profile: stored });
}

export async function clearProfileDraft(): Promise<void> {
  await idbDelete(KEYS.draft);
}

export async function saveProfileDraft(profile: Partial<UserProfile>): Promise<void> {
  await migrateFromLocalStorage();
  const lite = stripDraftForStorage(profile);
  await idbSet(KEYS.draft, { ...lite, savedAt: new Date().toISOString() });
}

export async function loadProfileDraft(): Promise<Partial<UserProfile> | null> {
  await migrateFromLocalStorage();
  const draft = await idbGet<{ savedAt: string } & Partial<UserProfile>>(KEYS.draft);
  if (!draft) return null;
  const { savedAt: _, ...profile } = draft;
  void _;
  return profile;
}

export async function loadProfile(): Promise<UserProfile | null> {
  await migrateFromLocalStorage();
  return idbGet<UserProfile>(KEYS.profile);
}

export async function saveResult(result: PipelineResult): Promise<void> {
  await migrateFromLocalStorage();
  const prev = await idbGet<PipelineResult>(KEYS.result);
  if (prev) {
    await idbSet("result-previous", prev);
  }
  await idbSet(KEYS.result, result);
  void pushUserDataToCloud({ result });
}

export async function loadPreviousResult(): Promise<PipelineResult | null> {
  await migrateFromLocalStorage();
  return idbGet<PipelineResult>("result-previous");
}

export async function loadResult(): Promise<PipelineResult | null> {
  try {
    await migrateFromLocalStorage();
    const raw = await idbGet<PipelineResult>(KEYS.result);
    if (!raw) return null;
    const profile = await idbGet<UserProfile>(KEYS.profile);
    return normalizePipelineResult(raw, profile);
  } catch {
    return null;
  }
}

export async function clearAll(): Promise<void> {
  await fullSystemReset();
}

/** Yerel + sunucu verilerini tamamen sıfırlar */
export async function fullSystemReset(): Promise<void> {
  notifyReset();
  clearBrowserStorage();
  resetIdbQueue();
  closeDB();

  try {
    await idbResetStore();
  } catch {
    /* devam */
  }

  try {
    await idbDestroy();
  } catch {
    /* devam */
  }

  closeDB();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    await apiFetch("/api/user/data", { method: "DELETE", cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
  } catch {
    /* offline veya misafir */
  }
}

export async function getStorageStats(): Promise<{
  hasProfile: boolean;
  hasResult: boolean;
  hasDraft: boolean;
  signalCount: number;
}> {
  await migrateFromLocalStorage();
  const [profile, result, draft, signals] = await Promise.all([
    idbGet<UserProfile>(KEYS.profile),
    idbGet<PipelineResult>(KEYS.result),
    idbGet<Partial<UserProfile>>(KEYS.draft),
    idbGet<GlobalInterestSignal[]>(KEYS.signals),
  ]);
  return {
    hasProfile: !!profile,
    hasResult: !!result,
    hasDraft: !!draft,
    signalCount: signals?.length ?? 0,
  };
}

export async function logInterestSignal(signal: GlobalInterestSignal): Promise<void> {
  const existing = (await idbGet<GlobalInterestSignal[]>(KEYS.signals)) ?? [];
  existing.push(signal);
  await idbSet(KEYS.signals, existing.slice(-2000));

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    await apiFetch("/api/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signal),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    /* offline veya zaman aşımı — yerel kayıt yeterli */
  }
}

export async function getSignalCount(): Promise<number> {
  try {
    const signals = (await idbGet<GlobalInterestSignal[]>(KEYS.signals)) ?? [];
    return signals.length;
  } catch {
    return 0;
  }
}

export async function getMatrixDeltas(): Promise<MatrixDeltas> {
  try {
    return (await idbGet<MatrixDeltas>(KEYS.matrixDeltas)) ?? {};
  } catch {
    return {};
  }
}

export async function saveMatrixDeltas(deltas: MatrixDeltas): Promise<void> {
  await idbSet(KEYS.matrixDeltas, deltas);
}

/** Sync fallback — yalnızca SSR/hydration öncesi; mümkünse async kullan */
export function loadProfileSync(): UserProfile | null {
  if (typeof window === "undefined") return null;
  return null;
}

export function loadResultSync(): PipelineResult | null {
  if (typeof window === "undefined") return null;
  return null;
}
