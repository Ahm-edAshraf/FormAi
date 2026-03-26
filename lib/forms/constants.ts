export const FORM_STATUS_VALUES = ["draft", "published", "archived"] as const;

export const FORM_VISIBILITY_VALUES = ["workspace", "public"] as const;

/** Must match `formFields.type` in `convex/schema.ts` / `convex/formFields.ts` */
export const FORM_FIELD_TYPE_VALUES = [
  "text",
  "textarea",
  "select",
  "radio",
  "checkbox",
  "rating",
  "date",
] as const;

export const FORM_FIELD_WIDTH_VALUES = ["full", "half"] as const;

export const FORM_FIELD_TYPE_LABELS = {
  text: "Short Text",
  textarea: "Long Text",
  select: "Dropdown",
  radio: "Single Choice",
  checkbox: "Multiple Choice",
  rating: "Rating",
  date: "Date",
} as const;

export const DEFAULT_FORM_TITLE = "Untitled form";
export const DEFAULT_FORM_DESCRIPTION = "";
export const DEFAULT_FORM_SUCCESS_MESSAGE = "Your response has been successfully submitted.";
export const MAX_DASHBOARD_FORMS = 50;
export const MAX_FORM_FIELDS = 100;
export const MAX_FORM_RESPONSES = 250;
export const ANALYTICS_MAX_DAYS = 365;
