import type { PipelineResult, UserProfile } from "@/lib/types";
import { apiFetch, IS_LOCAL_ONLY } from "@/lib/api";

export async function pushUserDataToCloud(payload: {
  profile?: UserProfile | null;
  result?: PipelineResult | null;
}): Promise<void> {
  if (IS_LOCAL_ONLY) return;
  try {
    await apiFetch("/api/user/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    /* offline */
  }
}

export async function pullUserDataFromCloud(): Promise<{
  profile: UserProfile | null;
  result: PipelineResult | null;
} | null> {
  if (IS_LOCAL_ONLY) return null;
  try {
    const res = await apiFetch("/api/user/data", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      profile: UserProfile | null;
      result: PipelineResult | null;
    };
    return data;
  } catch {
    return null;
  }
}
