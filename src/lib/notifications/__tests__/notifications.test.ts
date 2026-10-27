import { beforeEach, describe, expect, it, vi } from "vitest";

// In-memory stand-in for the JSON file store, so the real store logic is exercised.
let files: Record<string, unknown> = {};

vi.mock("@/lib/admin/data", () => ({
  readJsonFile: async (name: string, fallback: unknown) =>
    structuredClone(files[name] ?? fallback),
  writeJsonFile: async (name: string, data: unknown) => {
    files[name] = structuredClone(data);
  },
}));

import {
  createNotification,
  listNotifications,
  markAllRead,
  markRead,
  setUserPreferences,
} from "@/lib/notifications/store";

const ALICE = "user-alice";
const BOB = "user-bob";

describe("notification ownership and read state", () => {
  beforeEach(() => {
    files = {};
  });

  it("lists only the caller's notifications", async () => {
    await createNotification({ userId: ALICE, kind: "security", title: "a", body: "a" });
    await createNotification({ userId: BOB, kind: "security", title: "b", body: "b" });

    const alice = await listNotifications(ALICE, {});
    expect(alice.total).toBe(1);
    expect(alice.items.every((n) => n.userId === ALICE)).toBe(true);
  });

  it("cannot mark another user's notification as read", async () => {
    const bobItem = await createNotification({ userId: BOB, kind: "analysis", title: "b", body: "b" });
    const changed = await markRead(ALICE, bobItem!.id);
    expect(changed).toBe(false);

    const bob = await listNotifications(BOB, {});
    expect(bob.items[0].readAt).toBeNull();
  });

  it("persists read state and counts unread correctly", async () => {
    const first = await createNotification({ userId: ALICE, kind: "membership", title: "1", body: "1" });
    await createNotification({ userId: ALICE, kind: "membership", title: "2", body: "2" });

    expect(await markRead(ALICE, first!.id)).toBe(true);
    // Marking an already-read item again changes nothing.
    expect(await markRead(ALICE, first!.id)).toBe(false);

    const page = await listNotifications(ALICE, {});
    expect(page.unread).toBe(1);
  });

  it("mark-all only touches the caller's rows", async () => {
    await createNotification({ userId: ALICE, kind: "security", title: "1", body: "1" });
    await createNotification({ userId: BOB, kind: "security", title: "2", body: "2" });

    expect(await markAllRead(ALICE)).toBe(1);
    expect((await listNotifications(BOB, {})).unread).toBe(1);
  });

  it("skips kinds the user disabled in preferences", async () => {
    await setUserPreferences(ALICE, { analysis: false });
    const skipped = await createNotification({ userId: ALICE, kind: "analysis", title: "x", body: "x" });
    expect(skipped).toBeNull();
    expect((await listNotifications(ALICE, {})).total).toBe(0);
  });

  it("paginates within the caller's history", async () => {
    for (let i = 0; i < 5; i++) {
      await createNotification({ userId: ALICE, kind: "security", title: `${i}`, body: "" });
    }
    const page = await listNotifications(ALICE, { offset: 0, limit: 2 });
    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(5);
  });
});
