import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AnalyticsCtx = MutationCtx | QueryCtx;

export function getDateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function getRangeStartTimestamp(range: "7d" | "30d" | "all", now: number): number | null {
  if (range === "all") {
    return null;
  }

  const days = range === "7d" ? 7 : 30;
  return now - (days - 1) * 24 * 60 * 60 * 1000;
}

export async function incrementDailyStats(
  ctx: MutationCtx,
  formId: Id<"forms">,
  timestamp: number,
  patch: {
    viewCount?: number;
    startCount?: number;
    submissionCount?: number;
  },
) {
  const dateKey = getDateKey(timestamp);
  const existing = await ctx.db
    .query("formDailyStats")
    .withIndex("by_formId_and_dateKey", (q) => q.eq("formId", formId).eq("dateKey", dateKey))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      viewCount: Math.max(0, existing.viewCount + (patch.viewCount ?? 0)),
      startCount: Math.max(0, existing.startCount + (patch.startCount ?? 0)),
      submissionCount: Math.max(0, existing.submissionCount + (patch.submissionCount ?? 0)),
    });
    return existing._id;
  }

  return await ctx.db.insert("formDailyStats", {
    formId,
    dateKey,
    viewCount: Math.max(0, patch.viewCount ?? 0),
    startCount: Math.max(0, patch.startCount ?? 0),
    submissionCount: Math.max(0, patch.submissionCount ?? 0),
  });
}

export async function getSessionById(
  ctx: AnalyticsCtx,
  formId: Id<"forms">,
  sessionId: string,
) {
  return await ctx.db
    .query("submissionSessions")
    .withIndex("by_formId_and_sessionId", (q) => q.eq("formId", formId).eq("sessionId", sessionId))
    .unique();
}
