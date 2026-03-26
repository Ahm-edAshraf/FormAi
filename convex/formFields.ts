import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import {
  createFieldKey,
  getDefaultFieldLabel,
  requireFieldWithFormAccess,
  requireFormAccess,
} from "./lib/forms";
import { requireCurrentUser } from "./lib/auth";

const fieldTypeValidator = v.union(
  v.literal("text"),
  v.literal("textarea"),
  v.literal("select"),
  v.literal("radio"),
  v.literal("checkbox"),
  v.literal("rating"),
  v.literal("date"),
);

const fieldOptionValidator = v.object({
  label: v.string(),
  value: v.string(),
});

const validationValidator = v.object({
  minLength: v.union(v.number(), v.null()),
  maxLength: v.union(v.number(), v.null()),
  min: v.union(v.number(), v.null()),
  max: v.union(v.number(), v.null()),
  pattern: v.union(v.string(), v.null()),
});

const settingsValidator = v.object({
  allowMultiple: v.union(v.boolean(), v.null()),
  defaultValue: v.union(v.string(), v.null()),
  ratingScale: v.union(v.number(), v.null()),
});

async function touchForm(
  ctx: MutationCtx,
  formId: Id<"forms">,
  userId: Id<"users">,
) {
  await ctx.db.patch(formId, {
    updatedAt: Date.now(),
    updatedBy: userId,
  });
}

export const addField = mutation({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
    formId: v.id("forms"),
    type: fieldTypeValidator,
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const lastField = await ctx.db
      .query("formFields")
      .withIndex("by_formId_and_order", (q) => q.eq("formId", form._id))
      .order("desc")
      .take(1);
    const nextOrder = (lastField[0]?.order ?? -1) + 1;
    const fieldId = await ctx.db.insert("formFields", {
      formId: form._id,
      fieldKey: createFieldKey(args.type),
      type: args.type,
      label: getDefaultFieldLabel(args.type),
      description: "",
      placeholder: "",
      isRequired: false,
      order: nextOrder,
      width: "full",
      options:
        args.type === "select" || args.type === "radio" || args.type === "checkbox"
          ? [
              { label: "Option 1", value: "option-1" },
              { label: "Option 2", value: "option-2" },
            ]
          : [],
      validation: {
        minLength: null,
        maxLength: null,
        min: null,
        max: null,
        pattern: null,
      },
      settings: {
        allowMultiple: args.type === "checkbox" ? true : null,
        defaultValue: null,
        ratingScale: args.type === "rating" ? 5 : null,
      },
      createdAt: now,
      updatedAt: now,
    });

    await touchForm(ctx, form._id, user._id);

    const field = await ctx.db.get(fieldId);

    if (!field) {
      throw new Error("Failed to create field");
    }

    return field;
  },
});

export const updateField = mutation({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
    fieldId: v.id("formFields"),
    label: v.optional(v.string()),
    description: v.optional(v.string()),
    placeholder: v.optional(v.string()),
    isRequired: v.optional(v.boolean()),
    width: v.optional(v.union(v.literal("full"), v.literal("half"))),
    options: v.optional(v.array(fieldOptionValidator)),
    validation: v.optional(validationValidator),
    settings: v.optional(settingsValidator),
  },
  handler: async (ctx, args) => {
    const { field, form } = await requireFieldWithFormAccess(
      ctx,
      args.fieldId,
      args.clerkOrgId,
    );
    const user = await requireCurrentUser(ctx);
    const patch: {
      label?: string;
      description?: string;
      placeholder?: string;
      isRequired?: boolean;
      width?: "full" | "half";
      options?: Array<{ label: string; value: string }>;
      validation?: {
        minLength: number | null;
        maxLength: number | null;
        min: number | null;
        max: number | null;
        pattern: string | null;
      };
      settings?: {
        allowMultiple: boolean | null;
        defaultValue: string | null;
        ratingScale: number | null;
      };
      updatedAt?: number;
    } = {};

    if (args.label !== undefined) {
      patch.label = args.label.trim() || field.label;
    }

    if (args.description !== undefined) {
      patch.description = args.description.trim();
    }

    if (args.placeholder !== undefined) {
      patch.placeholder = args.placeholder.trim();
    }

    if (args.isRequired !== undefined) {
      patch.isRequired = args.isRequired;
    }

    if (args.width !== undefined) {
      patch.width = args.width;
    }

    if (args.options !== undefined) {
      patch.options = args.options;
    }

    if (args.validation !== undefined) {
      patch.validation = args.validation;
    }

    if (args.settings !== undefined) {
      patch.settings = args.settings;
    }

    if (Object.keys(patch).length === 0) {
      return field;
    }

    patch.updatedAt = Date.now();
    await ctx.db.patch(field._id, patch);
    await touchForm(ctx, form._id, user._id);

    const updatedField = await ctx.db.get(field._id);

    if (!updatedField) {
      throw new Error("Field not found after update");
    }

    return updatedField;
  },
});

export const removeField = mutation({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
    fieldId: v.id("formFields"),
  },
  handler: async (ctx, args) => {
    const { field, form } = await requireFieldWithFormAccess(
      ctx,
      args.fieldId,
      args.clerkOrgId,
    );
    const user = await requireCurrentUser(ctx);
    const remainingFields = await ctx.db
      .query("formFields")
      .withIndex("by_formId_and_order", (q) => q.eq("formId", form._id))
      .take(100);

    await ctx.db.delete(field._id);

    let nextOrder = 0;
    for (const candidate of remainingFields) {
      if (candidate._id === field._id) {
        continue;
      }

      if (candidate.order !== nextOrder) {
        await ctx.db.patch(candidate._id, {
          order: nextOrder,
          updatedAt: Date.now(),
        });
      }

      nextOrder += 1;
    }

    await touchForm(ctx, form._id, user._id);

    return { fieldId: field._id };
  },
});

export const reorderFields = mutation({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
    formId: v.id("forms"),
    fieldIds: v.array(v.id("formFields")),
  },
  handler: async (ctx, args) => {
    const form = await requireFormAccess(ctx, args.formId, args.clerkOrgId);
    const user = await requireCurrentUser(ctx);
    const existingFields = await ctx.db
      .query("formFields")
      .withIndex("by_formId_and_order", (q) => q.eq("formId", form._id))
      .take(100);

    if (existingFields.length !== args.fieldIds.length) {
      throw new Error("Field order payload does not match form fields");
    }

    const existingIds = new Set(existingFields.map((field) => field._id));

    for (const fieldId of args.fieldIds) {
      if (!existingIds.has(fieldId)) {
        throw new Error("Invalid field order payload");
      }
    }

    for (const [index, fieldId] of args.fieldIds.entries()) {
      await ctx.db.patch(fieldId, {
        order: index,
        updatedAt: Date.now(),
      });
    }

    await touchForm(ctx, form._id, user._id);

    return { formId: form._id };
  },
});
