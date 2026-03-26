import { v } from "convex/values";

import { MAX_FORM_FIELDS } from "../lib/forms/constants";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import { normalizeFormSlug, requireFormAccess } from "./lib/forms";
import { toPublishedField } from "./lib/formRuntime";

export const publish = mutation({
  args: {
    formId: v.id("forms"),
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);
    const user = await requireCurrentUser(ctx);
    const fields = await ctx.db
      .query("formFields")
      .withIndex("by_formId_and_order", (q) => q.eq("formId", form._id))
      .take(MAX_FORM_FIELDS);

    if (fields.length === 0) {
      throw new Error("Add at least one field before publishing");
    }

    const lastSnapshot = await ctx.db
      .query("formSnapshots")
      .withIndex("by_formId_and_version", (q) => q.eq("formId", form._id))
      .order("desc")
      .take(1);
    const version = (lastSnapshot[0]?.version ?? 0) + 1;
    const now = Date.now();
    const snapshotId = await ctx.db.insert("formSnapshots", {
      formId: form._id,
      version,
      source: "builder",
      title: form.title,
      description: form.description,
      slug: form.slug,
      fields: fields.map(toPublishedField),
      theme: {},
      publishedAt: now,
      createdBy: user._id,
    });

    await ctx.db.patch(form._id, {
      status: "published",
      visibility: "public",
      publishedSnapshotId: snapshotId,
      lastPublishedAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    return {
      snapshotId,
      version,
      publishedAt: now,
    };
  },
});

export const getPublicBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedSlug = normalizeFormSlug(args.slug);
    const snapshots = await ctx.db
      .query("formSnapshots")
      .withIndex("by_slug_and_publishedAt", (q) => q.eq("slug", normalizedSlug))
      .order("desc")
      .take(1);
    const snapshot = snapshots[0] ?? null;

    if (!snapshot) {
      return null;
    }

    const form = await ctx.db.get(snapshot.formId);

    if (
      !form ||
      form.status !== "published" ||
      form.publishedSnapshotId !== snapshot._id ||
      form.visibility !== "public"
    ) {
      return null;
    }

    return {
      form: {
        _id: form._id,
        submissionCount: form.submissionCount,
        viewCount: form.viewCount,
      },
      snapshot,
    };
  },
});

export const trackPublicView = mutation({
  args: {
    snapshotId: v.id("formSnapshots"),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);

    if (!snapshot) {
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

    await ctx.db.patch(form._id, {
      viewCount: form.viewCount + 1,
      updatedAt: Date.now(),
    });

    return { formId: form._id, viewCount: form.viewCount + 1 };
  },
});
