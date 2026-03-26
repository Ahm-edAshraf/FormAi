import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireActiveWorkspace, requireCurrentUser, requireWorkspaceAccess } from "./auth";

type FormAccessCtx = QueryCtx | MutationCtx;

export function normalizeFormSlug(value: string): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return normalized || "form";
}

export function createFieldKey(type: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${type}_${suffix}`;
}

export function getDefaultFieldLabel(type: string): string {
  switch (type) {
    case "textarea":
      return "Long answer";
    case "select":
      return "Choose an option";
    case "radio":
      return "Select one";
    case "checkbox":
      return "Select all that apply";
    case "rating":
      return "Rate your experience";
    case "date":
      return "Pick a date";
    default:
      return "Untitled question";
  }
}

export async function getFormById(
  ctx: FormAccessCtx,
  formId: Id<"forms">,
): Promise<Doc<"forms"> | null> {
  return await ctx.db.get(formId);
}

export async function requireFormAccess(
  ctx: FormAccessCtx,
  formId: Id<"forms">,
  clerkOrgId: string | null,
): Promise<Doc<"forms">> {
  const form = await getFormById(ctx, formId);

  if (!form) {
    throw new Error("Form not found");
  }

  await requireWorkspaceAccess(ctx, form.workspaceId, clerkOrgId);

  return form;
}

export async function requireFieldWithFormAccess(
  ctx: FormAccessCtx,
  fieldId: Id<"formFields">,
  clerkOrgId: string | null,
): Promise<{ field: Doc<"formFields">; form: Doc<"forms"> }> {
  const field = await ctx.db.get(fieldId);

  if (!field) {
    throw new Error("Field not found");
  }

  const form = await requireFormAccess(ctx, field.formId, clerkOrgId);
  return { field, form };
}

export async function ensureUniqueFormSlug(
  ctx: FormAccessCtx,
  slug: string,
  excludeFormId?: Id<"forms">,
): Promise<string> {
  const baseSlug = normalizeFormSlug(slug);
  let candidate = baseSlug;
  let attempt = 0;

  while (attempt < 10) {
    const existing = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique();

    if (!existing || existing._id === excludeFormId) {
      return candidate;
    }

    attempt += 1;
    candidate = `${baseSlug}-${attempt + 1}`.slice(0, 64);
  }

  throw new Error("Unable to generate a unique slug");
}

export async function createBlankFormRecord(
  ctx: MutationCtx,
  clerkOrgId: string | null,
  title: string,
): Promise<Doc<"forms">> {
  const workspace = await requireActiveWorkspace(ctx, clerkOrgId);
  const user = await requireCurrentUser(ctx);
  const now = Date.now();
  const slug = await ensureUniqueFormSlug(ctx, title);

  const formId = await ctx.db.insert("forms", {
    workspaceId: workspace._id,
    title,
    description: "",
    slug,
    status: "draft",
    visibility: "workspace",
    publishedSnapshotId: null,
    lastPublishedAt: null,
    submissionCount: 0,
    viewCount: 0,
    lastSubmissionAt: null,
    createdBy: user._id,
    updatedBy: user._id,
    createdAt: now,
    updatedAt: now,
  });

  const form = await ctx.db.get(formId);

  if (!form) {
    throw new Error("Failed to create form");
  }

  return form;
}
