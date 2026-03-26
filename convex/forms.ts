import { v } from "convex/values";

import {
  DEFAULT_FORM_SUCCESS_MESSAGE,
  DEFAULT_FORM_TITLE,
  MAX_DASHBOARD_FORMS,
  MAX_FORM_FIELDS,
} from "../lib/forms/constants";
import { mutation, query } from "./_generated/server";
import {
  createBlankFormRecord,
  ensureUniqueFormSlug,
  normalizeFormSlug,
  requireFormAccess,
} from "./lib/forms";
import { requireActiveWorkspace, requireCurrentUser } from "./lib/auth";

export const createBlank = mutation({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const form = await createBlankFormRecord(ctx, args.clerkOrgId, DEFAULT_FORM_TITLE);

    return {
      formId: form._id,
      slug: form.slug,
    };
  },
});

export const archive = mutation({
  args: {
    formId: v.id("forms"),
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    await ctx.db.patch(form._id, {
      status: "archived",
      updatedAt: now,
      updatedBy: user._id,
    });

    return { formId: form._id, status: "archived" as const };
  },
});

export const updateDraft = mutation({
  args: {
    formId: v.id("forms"),
    clerkOrgId: v.union(v.string(), v.null()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    successMessage: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);
    const user = await requireCurrentUser(ctx);
    const nextTitle = args.title?.trim();
    const nextDescription = args.description?.trim();
    const nextSuccessMessage = args.successMessage?.trim();
    const nextSlug = args.slug?.trim();
    const patch: {
      title?: string;
      description?: string;
      successMessage?: string;
      slug?: string;
      updatedAt?: number;
      updatedBy?: typeof user._id;
    } = {};

    if (nextTitle !== undefined) {
      patch.title = nextTitle || DEFAULT_FORM_TITLE;
    }

    if (nextDescription !== undefined) {
      patch.description = nextDescription;
    }

    if (nextSuccessMessage !== undefined) {
      patch.successMessage = nextSuccessMessage || DEFAULT_FORM_SUCCESS_MESSAGE;
    }

    if (nextSlug !== undefined) {
      patch.slug = await ensureUniqueFormSlug(ctx, nextSlug || form.title, form._id);
    }

    if (Object.keys(patch).length === 0) {
      return form;
    }

    patch.updatedAt = Date.now();
    patch.updatedBy = user._id;
    await ctx.db.patch(form._id, patch);

    const updated = await ctx.db.get(form._id);

    if (!updated) {
      throw new Error("Form not found after update");
    }

    return updated;
  },
});

export const checkSlugAvailability = query({
  args: {
    slug: v.string(),
    clerkOrgId: v.union(v.string(), v.null()),
    excludeFormId: v.optional(v.id("forms")),
  },
  handler: async (ctx, args) => {
    await requireActiveWorkspace(ctx, args.clerkOrgId);

    const normalizedSlug = normalizeFormSlug(args.slug);
    const existing = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
      .unique();

    return {
      slug: normalizedSlug,
      isAvailable: !existing || existing._id === args.excludeFormId,
    };
  },
});

export const getDashboardData = query({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const workspace = await requireActiveWorkspace(ctx, args.clerkOrgId);
    const forms = await ctx.db
      .query("forms")
      .withIndex("by_workspaceId_and_updatedAt", (q) =>
        q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(MAX_DASHBOARD_FORMS * 3);
    const visibleForms = forms.filter((form) => form.status !== "archived").slice(0, MAX_DASHBOARD_FORMS);

    const stats = visibleForms.reduce(
      (accumulator, form) => {
        accumulator.totalForms += 1;
        accumulator.totalSubmissions += form.submissionCount;
        accumulator.totalViews += form.viewCount;

        if (form.status === "published") {
          accumulator.publishedForms += 1;
        }

        if (form.status === "draft") {
          accumulator.draftForms += 1;
        }

        return accumulator;
      },
      {
        totalForms: 0,
        totalSubmissions: 0,
        totalViews: 0,
        publishedForms: 0,
        draftForms: 0,
      },
    );

      return {
        workspace,
        forms: visibleForms,
        stats,
        hasMore: visibleForms.length === MAX_DASHBOARD_FORMS,
      };
    },
});

export const deleteForm = mutation({
  args: {
    formId: v.id("forms"),
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);

    const fields = await ctx.db
      .query("formFields")
      .withIndex("by_formId_and_order", (q) => q.eq("formId", form._id))
      .take(MAX_FORM_FIELDS);

    for (const field of fields) {
      await ctx.db.delete(field._id);
    }

    const snapshots = await ctx.db
      .query("formSnapshots")
      .withIndex("by_formId_and_version", (q) => q.eq("formId", form._id))
      .take(MAX_FORM_FIELDS);
    for (const snapshot of snapshots) {
      await ctx.db.delete(snapshot._id);
    }

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_formId_and_submittedAt", (q) => q.eq("formId", form._id))
      .take(1000);
    for (const submission of submissions) {
      await ctx.db.delete(submission._id);
    }

    const sessions = await ctx.db
      .query("submissionSessions")
      .withIndex("by_formId_and_startedAt", (q) => q.eq("formId", form._id))
      .take(1000);
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    const dailyStats = await ctx.db
      .query("formDailyStats")
      .withIndex("by_formId_and_dateKey", (q) => q.eq("formId", form._id))
      .take(400);
    for (const row of dailyStats) {
      await ctx.db.delete(row._id);
    }

    const jobs = await ctx.db
      .query("aiGenerationJobs")
      .withIndex("by_formId", (q) => q.eq("formId", form._id))
      .take(200);
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }

    await ctx.db.delete(form._id);

    return { formId: form._id };
  },
});

export const getDraft = query({
  args: {
    formId: v.id("forms"),
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);
    const publishedSnapshot = form.publishedSnapshotId
      ? await ctx.db.get(form.publishedSnapshotId)
      : null;
    const fields = await ctx.db
      .query("formFields")
      .withIndex("by_formId_and_order", (q) => q.eq("formId", form._id))
      .take(MAX_FORM_FIELDS);

    return {
      form,
      publishedSnapshot: publishedSnapshot
        ? {
            _id: publishedSnapshot._id,
            slug: publishedSnapshot.slug,
            version: publishedSnapshot.version,
            publishedAt: publishedSnapshot.publishedAt,
          }
        : null,
      fields,
      hasMoreFields: fields.length === MAX_FORM_FIELDS,
    };
  },
});
