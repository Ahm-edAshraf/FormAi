import { v } from "convex/values";

import { DEFAULT_FORM_SUCCESS_MESSAGE } from "../lib/forms/constants";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import {
  AI_MODEL,
  AI_PROVIDER,
  USER_BURST_LIMIT,
  USER_DAILY_LIMIT,
  WORKSPACE_DAILY_LIMIT,
  getUserGenerationUsage,
  getWorkspaceDailyGenerationUsage,
} from "./lib/ai";
import { requireActiveWorkspace, requireCurrentUser } from "./lib/auth";
import { createFieldKey, ensureUniqueFormSlug } from "./lib/forms";

const generatedFieldTypeValidator = v.union(
  v.literal("text"),
  v.literal("textarea"),
  v.literal("select"),
  v.literal("radio"),
  v.literal("checkbox"),
  v.literal("rating"),
  v.literal("date"),
);

const generatedFieldWidthValidator = v.union(v.literal("full"), v.literal("half"));

const generatedFieldOptionValidator = v.object({
  label: v.string(),
  value: v.string(),
});

const generatedFieldValidationValidator = v.object({
  minLength: v.union(v.number(), v.null()),
  maxLength: v.union(v.number(), v.null()),
  min: v.union(v.number(), v.null()),
  max: v.union(v.number(), v.null()),
  pattern: v.union(v.string(), v.null()),
});

const generatedFieldSettingsValidator = v.object({
  allowMultiple: v.union(v.boolean(), v.null()),
  defaultValue: v.union(v.string(), v.null()),
  ratingScale: v.union(v.number(), v.null()),
});

const generatedFieldValidator = v.object({
  type: generatedFieldTypeValidator,
  label: v.string(),
  description: v.string(),
  placeholder: v.string(),
  isRequired: v.boolean(),
  width: generatedFieldWidthValidator,
  options: v.array(generatedFieldOptionValidator),
  validation: generatedFieldValidationValidator,
  settings: generatedFieldSettingsValidator,
});

async function createRateLimitedJob(
  ctx: MutationCtx,
  args: {
    clerkOrgId: string | null;
    prompt: string;
    normalizedPrompt: string;
    userId: Id<"users">;
    workspaceId: Id<"workspaces">;
    failureCode: string;
    failureMessage: string;
  },
): Promise<Id<"aiGenerationJobs">> {
  const now = Date.now();

  return await ctx.db.insert("aiGenerationJobs", {
    workspaceId: args.workspaceId,
    userId: args.userId,
    clerkOrgId: args.clerkOrgId,
    provider: AI_PROVIDER,
    model: AI_MODEL,
    status: "rate_limited",
    prompt: args.prompt,
    normalizedPrompt: args.normalizedPrompt,
    generatedTitle: null,
    fieldCount: null,
    formId: null,
    failureCode: args.failureCode,
    failureMessage: args.failureMessage,
    startedAt: null,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

export const beginGeneration = internalMutation({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
    prompt: v.string(),
    normalizedPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const workspace = await requireActiveWorkspace(ctx, args.clerkOrgId);
    const now = Date.now();
    const userUsage = await getUserGenerationUsage(ctx, user._id, now);

    if (userUsage.burstCount >= USER_BURST_LIMIT) {
      const jobId = await createRateLimitedJob(ctx, {
        clerkOrgId: args.clerkOrgId,
        prompt: args.prompt,
        normalizedPrompt: args.normalizedPrompt,
        userId: user._id,
        workspaceId: workspace._id,
        failureCode: "user_burst_limit",
        failureMessage: "Please wait about a minute before generating another draft.",
      });

      return {
        ok: false as const,
        jobId,
        errorCode: "user_burst_limit",
        errorMessage: "Please wait about a minute before generating another draft.",
      };
    }

    if (userUsage.dailyCount >= USER_DAILY_LIMIT) {
      const jobId = await createRateLimitedJob(ctx, {
        clerkOrgId: args.clerkOrgId,
        prompt: args.prompt,
        normalizedPrompt: args.normalizedPrompt,
        userId: user._id,
        workspaceId: workspace._id,
        failureCode: "user_daily_limit",
        failureMessage: "You have reached your daily AI draft limit for today.",
      });

      return {
        ok: false as const,
        jobId,
        errorCode: "user_daily_limit",
        errorMessage: "You have reached your daily AI draft limit for today.",
      };
    }

    const workspaceDailyCount = await getWorkspaceDailyGenerationUsage(ctx, workspace._id, now);

    if (workspaceDailyCount >= WORKSPACE_DAILY_LIMIT) {
      const jobId = await createRateLimitedJob(ctx, {
        clerkOrgId: args.clerkOrgId,
        prompt: args.prompt,
        normalizedPrompt: args.normalizedPrompt,
        userId: user._id,
        workspaceId: workspace._id,
        failureCode: "workspace_daily_limit",
        failureMessage: "This workspace has reached its daily AI draft limit for today.",
      });

      return {
        ok: false as const,
        jobId,
        errorCode: "workspace_daily_limit",
        errorMessage: "This workspace has reached its daily AI draft limit for today.",
      };
    }

    const jobId = await ctx.db.insert("aiGenerationJobs", {
      workspaceId: workspace._id,
      userId: user._id,
      clerkOrgId: args.clerkOrgId,
      provider: AI_PROVIDER,
      model: AI_MODEL,
      status: "running",
      prompt: args.prompt,
      normalizedPrompt: args.normalizedPrompt,
      generatedTitle: null,
      fieldCount: null,
      formId: null,
      failureCode: null,
      failureMessage: null,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ok: true as const,
      jobId,
    };
  },
});

export const markGenerationFailed = internalMutation({
  args: {
    jobId: v.id("aiGenerationJobs"),
    failureCode: v.string(),
    failureMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Generation job not found");
    }

    if (job.status === "succeeded") {
      return job;
    }

    const now = Date.now();
    await ctx.db.patch(job._id, {
      status: "failed",
      failureCode: args.failureCode,
      failureMessage: args.failureMessage,
      completedAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(job._id);
  },
});

export const completeGenerationSuccess = internalMutation({
  args: {
    jobId: v.id("aiGenerationJobs"),
    title: v.string(),
    description: v.string(),
    fields: v.array(generatedFieldValidator),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Generation job not found");
    }

    const now = Date.now();
    const slug = await ensureUniqueFormSlug(ctx, args.title);
    const formId = await ctx.db.insert("forms", {
      workspaceId: job.workspaceId,
      title: args.title,
      description: args.description,
      successMessage: DEFAULT_FORM_SUCCESS_MESSAGE,
      slug,
      status: "draft",
      visibility: "workspace",
      publishedSnapshotId: null,
      lastPublishedAt: null,
      submissionCount: 0,
      viewCount: 0,
      lastSubmissionAt: null,
      createdBy: job.userId,
      updatedBy: job.userId,
      createdAt: now,
      updatedAt: now,
    });

    for (const [index, field] of args.fields.entries()) {
      await ctx.db.insert("formFields", {
        formId,
        fieldKey: createFieldKey(field.type),
        type: field.type,
        label: field.label,
        description: field.description,
        placeholder: field.placeholder,
        isRequired: field.isRequired,
        order: index,
        width: field.width,
        options: field.options,
        validation: field.validation,
        settings: field.settings,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(job._id, {
      status: "succeeded",
      generatedTitle: args.title,
      fieldCount: args.fields.length,
      formId,
      failureCode: null,
      failureMessage: null,
      completedAt: now,
      updatedAt: now,
    });

    return { formId };
  },
});
