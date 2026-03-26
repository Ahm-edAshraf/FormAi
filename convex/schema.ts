import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkUserId: v.string(),
    email: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    defaultWorkspaceKey: v.union(v.string(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_clerkUserId", ["clerkUserId"]),

  workspaces: defineTable({
    workspaceKey: v.string(),
    kind: v.union(v.literal("personal"), v.literal("organization")),
    clerkOrgId: v.union(v.string(), v.null()),
    ownerClerkUserId: v.string(),
    name: v.string(),
    slug: v.string(),
    imageUrl: v.union(v.string(), v.null()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspaceKey", ["workspaceKey"])
    .index("by_clerkOrgId", ["clerkOrgId"])
    .index("by_slug", ["slug"]),

  forms: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    slug: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
    visibility: v.union(v.literal("workspace"), v.literal("public")),
    publishedSnapshotId: v.union(v.id("formSnapshots"), v.null()),
    lastPublishedAt: v.union(v.number(), v.null()),
    submissionCount: v.number(),
    viewCount: v.number(),
    lastSubmissionAt: v.union(v.number(), v.null()),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspaceId_and_updatedAt", ["workspaceId", "updatedAt"])
    .index("by_workspaceId_and_status", ["workspaceId", "status"])
    .index("by_slug", ["slug"]),

  formFields: defineTable({
    formId: v.id("forms"),
    fieldKey: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("textarea"),
      v.literal("select"),
      v.literal("radio"),
      v.literal("checkbox"),
      v.literal("rating"),
      v.literal("date"),
    ),
    label: v.string(),
    description: v.string(),
    placeholder: v.string(),
    isRequired: v.boolean(),
    order: v.number(),
    width: v.union(v.literal("full"), v.literal("half")),
    options: v.array(
      v.object({
        label: v.string(),
        value: v.string(),
      }),
    ),
    validation: v.object({
      minLength: v.union(v.number(), v.null()),
      maxLength: v.union(v.number(), v.null()),
      min: v.union(v.number(), v.null()),
      max: v.union(v.number(), v.null()),
      pattern: v.union(v.string(), v.null()),
    }),
    settings: v.object({
      allowMultiple: v.union(v.boolean(), v.null()),
      defaultValue: v.union(v.string(), v.null()),
      ratingScale: v.union(v.number(), v.null()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_formId_and_order", ["formId", "order"])
    .index("by_formId_and_fieldKey", ["formId", "fieldKey"]),

  formSnapshots: defineTable({
    formId: v.id("forms"),
    version: v.number(),
    source: v.string(),
    title: v.string(),
    description: v.string(),
    slug: v.string(),
    fields: v.array(v.any()),
    theme: v.object({}),
    publishedAt: v.union(v.number(), v.null()),
    createdBy: v.id("users"),
  })
    .index("by_formId_and_version", ["formId", "version"])
    .index("by_formId_and_publishedAt", ["formId", "publishedAt"]),

  aiGenerationJobs: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    clerkOrgId: v.union(v.string(), v.null()),
    provider: v.string(),
    model: v.string(),
    status: v.union(
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("rate_limited"),
    ),
    prompt: v.string(),
    normalizedPrompt: v.string(),
    generatedTitle: v.union(v.string(), v.null()),
    fieldCount: v.union(v.number(), v.null()),
    formId: v.union(v.id("forms"), v.null()),
    failureCode: v.union(v.string(), v.null()),
    failureMessage: v.union(v.string(), v.null()),
    startedAt: v.union(v.number(), v.null()),
    completedAt: v.union(v.number(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId_and_createdAt", ["userId", "createdAt"])
    .index("by_workspaceId_and_createdAt", ["workspaceId", "createdAt"])
    .index("by_formId", ["formId"]),
});
