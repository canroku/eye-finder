import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  readAnalytics,
  readCountryFeedback,
  readFeedback,
  readSignalsCount,
  readWaitlist,
} from "@/lib/admin/data";
import { listUsers } from "@/lib/auth/store";
import { countUserDataFiles } from "@/lib/auth/user-data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [feedback, countryFeedback, waitlist, analytics, users, signals, cloudUsers] =
    await Promise.all([
      readFeedback(),
      readCountryFeedback(),
      readWaitlist(),
      readAnalytics(),
      listUsers(),
      readSignalsCount(),
      countUserDataFiles(),
    ]);

  const feedbackAvg =
    feedback.length > 0
      ? Math.round((feedback.reduce((s, f) => s + f.rating, 0) / feedback.length) * 10) / 10
      : 0;

  const countryVotes = { yes: 0, partial: 0, no: 0 };
  countryFeedback.forEach((f) => {
    countryVotes[f.vote] += 1;
  });

  const eventCounts: Record<string, number> = {};
  analytics.forEach((e) => {
    eventCounts[e.name] = (eventCounts[e.name] ?? 0) + 1;
  });

  return NextResponse.json({
    feedback: { count: feedback.length, average: feedbackAvg },
    countryFeedback: { count: countryFeedback.length, summary: countryVotes },
    waitlist: { count: waitlist.length },
    analytics: { total: analytics.length, topEvents: eventCounts },
    users: {
      count: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      tiers: {
        free: users.filter((u) => u.tier === "free").length,
        plus: users.filter((u) => u.tier === "plus").length,
        pro: users.filter((u) => u.tier === "pro").length,
      },
    },
    signals,
    cloudUsers,
  });
}
