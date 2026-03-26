import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import type { PublishedFormField } from "../../lib/forms/public-runtime";

export const fieldTypeValidator = v.union(
  v.literal("text"),
  v.literal("textarea"),
  v.literal("select"),
  v.literal("radio"),
  v.literal("checkbox"),
  v.literal("rating"),
  v.literal("date"),
);

export const fieldWidthValidator = v.union(v.literal("full"), v.literal("half"));

export const fieldOptionValidator = v.object({
  label: v.string(),
  value: v.string(),
});

export const fieldValidationValidator = v.object({
  minLength: v.union(v.number(), v.null()),
  maxLength: v.union(v.number(), v.null()),
  min: v.union(v.number(), v.null()),
  max: v.union(v.number(), v.null()),
  pattern: v.union(v.string(), v.null()),
});

export const fieldSettingsValidator = v.object({
  allowMultiple: v.union(v.boolean(), v.null()),
  defaultValue: v.union(v.string(), v.null()),
  ratingScale: v.union(v.number(), v.null()),
});

export const publishedFieldValidator = v.object({
  fieldKey: v.string(),
  type: fieldTypeValidator,
  label: v.string(),
  description: v.string(),
  placeholder: v.string(),
  isRequired: v.boolean(),
  order: v.number(),
  width: fieldWidthValidator,
  options: v.array(fieldOptionValidator),
  validation: fieldValidationValidator,
  settings: fieldSettingsValidator,
});

export const submissionAnswerValueValidator = v.union(
  v.string(),
  v.number(),
  v.array(v.string()),
);

export function toPublishedField(field: Doc<"formFields">): PublishedFormField {
  return {
    fieldKey: field.fieldKey,
    type: field.type,
    label: field.label,
    description: field.description,
    placeholder: field.placeholder,
    isRequired: field.isRequired,
    order: field.order,
    width: field.width,
    options: field.options,
    validation: field.validation,
    settings: field.settings,
  };
}
