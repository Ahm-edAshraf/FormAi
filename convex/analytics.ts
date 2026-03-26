import { v } from "convex/values";

import { ANALYTICS_MAX_DAYS } from "../lib/forms/constants";
import { mutation, query } from "./_generated/server";
import { getDateKey, getRangeStartTimestamp, getSessionById, incrementDailyStats } from "./lib/analytics";
import { requireFormAccess } from "./lib/forms";

type AnalyticsRange = "7d" | "30d" | "all";

function formatAverageDuration(totalMs: number, count: number): string | null {
  if (count === 0) {
    return null;
  }

  const averageMs = Math.round(totalMs / count);
  const totalSeconds = Math.max(1, Math.round(averageMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function buildRangeDateKeys(range: AnalyticsRange, rows: Array<{ dateKey: string }>, now: number) {
  if (range === "all") {
    return rows.map((row) => row.dateKey);
  }

  const dayCount = range === "7d" ? 7 : 30;
  return Array.from({ length: dayCount }, (_, index) => {
    const timestamp = now - (dayCount - index - 1) * 24 * 60 * 60 * 1000;
    return getDateKey(timestamp);
  });
}

export const trackSubmissionStart = mutation({
  args: {
    snapshotId: v.id("formSnapshots"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);

    if (!snapshot || snapshot.publishedAt === null) {
      throw new Error("Published form not found");
    }

    const form = await ctx.db.get(snapshot.formId);

    if (
      !form ||
      form.status !== "published" ||
      form.publishedSnapshotId !== snapshot._id ||
      form.visibility !== "public"
    ) {
      throw new Error("Published form not found");
    }

    const now = Date.now();
    const existingSession = await getSessionById(ctx, form._id, args.sessionId);

    if (!existingSession) {
      await ctx.db.insert("submissionSessions", {
        formId: form._id,
        snapshotId: snapshot._id,
        sessionId: args.sessionId,
        viewedAt: now,
        startedAt: now,
        submittedAt: null,
      });

      await ctx.db.patch(form._id, {
        viewCount: form.viewCount + 1,
        updatedAt: now,
      });
      await incrementDailyStats(ctx, form._id, now, { viewCount: 1, startCount: 1 });
      return { startedAt: now };
    }

    if (existingSession.startedAt === null) {
      await ctx.db.patch(existingSession._id, {
        viewedAt: existingSession.viewedAt ?? now,
        startedAt: now,
      });
      await incrementDailyStats(ctx, form._id, now, { startCount: 1 });
      return { startedAt: now };
    }

    return { startedAt: existingSession.startedAt };
  },
});

export const getOverview = query({
  args: {
    formId: v.id("forms"),
    clerkOrgId: v.union(v.string(), v.null()),
    range: v.union(v.literal("7d"), v.literal("30d"), v.literal("all")),
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);
    const now = Date.now();
    const startTimestamp = getRangeStartTimestamp(args.range, now);
    const startDateKey = startTimestamp === null ? null : getDateKey(startTimestamp);

    const dailyRows = await ctx.db
      .query("formDailyStats")
      .withIndex("by_formId_and_dateKey", (q) => q.eq("formId", form._id))
      .order("desc")
      .take(ANALYTICS_MAX_DAYS);

    const filteredRows = dailyRows
      .filter((row) => (startDateKey === null ? true : row.dateKey >= startDateKey))
      .reverse();

    const rowMap = new Map(filteredRows.map((row) => [row.dateKey, row]));
    const dateKeys = buildRangeDateKeys(args.range, filteredRows, now);
    const series = dateKeys.map((dateKey) => {
      const row = rowMap.get(dateKey);
      return {
        date: dateKey,
        label: new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        views: row?.viewCount ?? 0,
        starts: row?.startCount ?? 0,
        submissions: row?.submissionCount ?? 0,
      };
    });

    const sessions = await ctx.db
      .query("submissionSessions")
      .withIndex("by_formId_and_submittedAt", (q) => q.eq("formId", form._id))
      .order("desc")
      .take(1000);

    let totalDurationMs = 0;
    let completedSessionCount = 0;

    for (const session of sessions) {
      if (session.submittedAt === null || session.startedAt === null) {
        continue;
      }

      if (startTimestamp !== null && session.submittedAt < startTimestamp) {
        continue;
      }

      totalDurationMs += Math.max(0, session.submittedAt - session.startedAt);
      completedSessionCount += 1;
    }

    const totalViews = series.reduce((sum, row) => sum + row.views, 0);
    const totalStarts = series.reduce((sum, row) => sum + row.starts, 0);
    const totalSubmissions = series.reduce((sum, row) => sum + row.submissions, 0);

    return {
      form: {
        _id: form._id,
        title: form.title,
      },
      range: args.range,
      stats: {
        views: totalViews,
        starts: totalStarts,
        submissions: totalSubmissions,
        completionRate:
          totalStarts > 0 ? Math.round((totalSubmissions / totalStarts) * 100) : null,
        avgTime: formatAverageDuration(totalDurationMs, completedSessionCount),
      },
      series,
    };
  },
});
