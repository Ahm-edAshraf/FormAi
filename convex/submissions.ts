import { v } from "convex/values";

import {
  formatSubmissionAnswer,
  validateSubmissionAnswers,
  type PublishedFormField,
} from "../lib/forms/public-runtime";
import { MAX_FORM_RESPONSES } from "../lib/forms/constants";
import { mutation, query } from "./_generated/server";
import { getRangeStartTimestamp, getSessionById, incrementDailyStats } from "./lib/analytics";
import { requireCurrentUser } from "./lib/auth";
import { requireFormAccess } from "./lib/forms";
import { submissionAnswerValueValidator } from "./lib/formRuntime";

export const submitPublic = mutation({
  args: {
    snapshotId: v.id("formSnapshots"),
    sessionId: v.string(),
    answers: v.record(v.string(), submissionAnswerValueValidator),
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

    const validation = validateSubmissionAnswers(
      snapshot.fields as PublishedFormField[],
      args.answers,
    );

    if (!validation.isValid) {
      throw new Error(JSON.stringify(validation.errors));
    }

    const now = Date.now();
    const session = await getSessionById(ctx, form._id, args.sessionId);
    const submissionId = await ctx.db.insert("submissions", {
      formId: form._id,
      snapshotId: snapshot._id,
      answers: validation.values,
      submittedAt: now,
    });

    if (!session) {
      await ctx.db.insert("submissionSessions", {
        formId: form._id,
        snapshotId: snapshot._id,
        sessionId: args.sessionId,
        viewedAt: now,
        startedAt: now,
        submittedAt: now,
      });
      await incrementDailyStats(ctx, form._id, now, {
        viewCount: 1,
        startCount: 1,
        submissionCount: 1,
      });
    } else {
      const sessionPatch: {
        viewedAt?: number;
        startedAt?: number;
        submittedAt: number;
      } = {
        submittedAt: now,
      };

      if (session.viewedAt === null) {
        sessionPatch.viewedAt = now;
      }

      let shouldIncrementStart = false;
      if (session.startedAt === null) {
        sessionPatch.startedAt = now;
        shouldIncrementStart = true;
      }

      await ctx.db.patch(session._id, sessionPatch);
      await incrementDailyStats(ctx, form._id, now, {
        startCount: shouldIncrementStart ? 1 : 0,
        submissionCount: 1,
      });
    }

    await ctx.db.patch(form._id, {
      submissionCount: form.submissionCount + 1,
      lastSubmissionAt: now,
      updatedAt: now,
    });

    return {
      submissionId,
      submittedAt: now,
    };
  },
});

export const listForOwner = query({
  args: {
    formId: v.id("forms"),
    clerkOrgId: v.union(v.string(), v.null()),
    dateRange: v.union(v.literal("all"), v.literal("7d"), v.literal("30d")),
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);
    const snapshot = form.publishedSnapshotId
      ? await ctx.db.get(form.publishedSnapshotId)
      : null;
    const startTimestamp = getRangeStartTimestamp(args.dateRange, Date.now());
    const submissions = (await ctx.db
      .query("submissions")
      .withIndex("by_formId_and_submittedAt", (q) => q.eq("formId", form._id))
      .order("desc")
      .take(MAX_FORM_RESPONSES)).filter((submission) =>
      startTimestamp === null ? true : submission.submittedAt >= startTimestamp,
    );
    const fields = (snapshot?.fields ?? []) as PublishedFormField[];

    return {
      form: {
        _id: form._id,
        title: form.title,
        submissionCount: form.submissionCount,
        viewCount: form.viewCount,
        lastPublishedAt: form.lastPublishedAt,
      },
      snapshot: snapshot
        ? {
            _id: snapshot._id,
            version: snapshot.version,
            title: snapshot.title,
            fields,
          }
        : null,
      stats: {
        totalResponses: form.submissionCount,
        totalViews: form.viewCount,
        conversionRate:
          form.viewCount > 0 ? Math.round((form.submissionCount / form.viewCount) * 100) : null,
      },
      submissions: submissions.map((submission) => ({
        _id: submission._id,
        submittedAt: submission.submittedAt,
        answers: submission.answers,
        preview: fields.slice(0, 3).map((field) => ({
          fieldKey: field.fieldKey,
          label: field.label,
          type: field.type,
          value: formatSubmissionAnswer(field, submission.answers[field.fieldKey]),
        })),
      })),
      hasMore: submissions.length === MAX_FORM_RESPONSES,
    };
  },
});

export const deleteForOwner = mutation({
  args: {
    submissionId: v.id("submissions"),
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);

    if (!submission) {
      throw new Error("Submission not found");
    }

    const form = await requireFormAccess(ctx, submission.formId, args.clerkOrgId);
    const user = await requireCurrentUser(ctx);
    await ctx.db.delete(submission._id);

    const nextSubmissionCount = Math.max(0, form.submissionCount - 1);
    const remainingLatest = await ctx.db
      .query("submissions")
      .withIndex("by_formId_and_submittedAt", (q) => q.eq("formId", form._id))
      .order("desc")
      .take(1);

    await ctx.db.patch(form._id, {
      submissionCount: nextSubmissionCount,
      lastSubmissionAt: remainingLatest[0]?.submittedAt ?? null,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    await incrementDailyStats(ctx, form._id, submission.submittedAt, { submissionCount: -1 });

    return { submissionId: submission._id };
  },
});
