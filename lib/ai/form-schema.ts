import { DEFAULT_FORM_DESCRIPTION, DEFAULT_FORM_TITLE } from "../forms/constants";

const SUPPORTED_FIELD_TYPES = [
  "text",
  "textarea",
  "select",
  "radio",
  "checkbox",
  "rating",
  "date",
] as const;

const SUPPORTED_WIDTHS = ["full", "half"] as const;

export type GeneratedFieldType = (typeof SUPPORTED_FIELD_TYPES)[number];
export type GeneratedFieldWidth = (typeof SUPPORTED_WIDTHS)[number];

export type GeneratedFieldOption = {
  label: string;
  value: string;
};

export type GeneratedFieldValidation = {
  minLength: number | null;
  maxLength: number | null;
  min: number | null;
  max: number | null;
  pattern: string | null;
};

export type GeneratedFieldSettings = {
  allowMultiple: boolean | null;
  defaultValue: string | null;
  ratingScale: number | null;
};

export type GeneratedFieldDraft = {
  type: GeneratedFieldType;
  label: string;
  description: string;
  placeholder: string;
  isRequired: boolean;
  width: GeneratedFieldWidth;
  options: GeneratedFieldOption[];
  validation: GeneratedFieldValidation;
  settings: GeneratedFieldSettings;
};

export type GeneratedFormDraft = {
  title: string;
  description: string;
  fields: GeneratedFieldDraft[];
};

type LooseGeneratedFieldDraft = {
  type?: unknown;
  label?: unknown;
  description?: unknown;
  placeholder?: unknown;
  isRequired?: unknown;
  width?: unknown;
  options?: unknown;
  validation?: unknown;
  settings?: unknown;
};

type LooseGeneratedFormDraft = {
  title?: unknown;
  description?: unknown;
  fields?: unknown;
};

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function slugifyOptionValue(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || "option";
}

function coerceFieldType(value: unknown): GeneratedFieldType {
  return SUPPORTED_FIELD_TYPES.includes(value as GeneratedFieldType)
    ? (value as GeneratedFieldType)
    : "text";
}

function coerceWidth(value: unknown): GeneratedFieldWidth {
  return SUPPORTED_WIDTHS.includes(value as GeneratedFieldWidth)
    ? (value as GeneratedFieldWidth)
    : "full";
}

function coerceNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeValidation(value: unknown): GeneratedFieldValidation {
  const candidate = typeof value === "object" && value !== null ? value : {};
  const minLength = coerceNullableNumber((candidate as Record<string, unknown>).minLength);
  const maxLength = coerceNullableNumber((candidate as Record<string, unknown>).maxLength);
  const min = coerceNullableNumber((candidate as Record<string, unknown>).min);
  const max = coerceNullableNumber((candidate as Record<string, unknown>).max);

  return {
    minLength,
    maxLength: maxLength !== null && minLength !== null && maxLength < minLength ? null : maxLength,
    min,
    max: max !== null && min !== null && max < min ? null : max,
    pattern: trimString((candidate as Record<string, unknown>).pattern) || null,
  };
}

function normalizeSettings(
  value: unknown,
  fieldType: GeneratedFieldType,
): GeneratedFieldSettings {
  const candidate = typeof value === "object" && value !== null ? value : {};
  const defaultValue = trimString((candidate as Record<string, unknown>).defaultValue) || null;
  const ratingScale = coerceNullableNumber((candidate as Record<string, unknown>).ratingScale);

  return {
    allowMultiple: fieldType === "checkbox" ? true : null,
    defaultValue,
    ratingScale:
      fieldType === "rating" && ratingScale !== null
        ? Math.max(3, Math.min(10, Math.round(ratingScale)))
        : null,
  };
}

function normalizeOptions(
  value: unknown,
  fieldType: GeneratedFieldType,
): GeneratedFieldOption[] {
  if (!["select", "radio", "checkbox"].includes(fieldType)) {
    return [];
  }

  const source = Array.isArray(value) ? value : [];
  const normalizedOptions: GeneratedFieldOption[] = [];

  for (const option of source) {
    if (typeof option !== "object" || option === null) {
      continue;
    }

    const label = trimString((option as Record<string, unknown>).label);

    if (!label) {
      continue;
    }

    const explicitValue = trimString((option as Record<string, unknown>).value);
    const normalizedValue = slugifyOptionValue(explicitValue || label);

    if (normalizedOptions.some((candidate) => candidate.value === normalizedValue)) {
      continue;
    }

    normalizedOptions.push({ label, value: normalizedValue });
  }

  if (normalizedOptions.length > 0) {
    return normalizedOptions;
  }

  return [
    { label: "Option 1", value: "option-1" },
    { label: "Option 2", value: "option-2" },
  ];
}

function normalizeField(input: LooseGeneratedFieldDraft): GeneratedFieldDraft {
  const type = coerceFieldType(input.type);

  return {
    type,
    label: trimString(input.label) || "Untitled question",
    description: trimString(input.description),
    placeholder: trimString(input.placeholder),
    isRequired: Boolean(input.isRequired),
    width: coerceWidth(input.width),
    options: normalizeOptions(input.options, type),
    validation: normalizeValidation(input.validation),
    settings: normalizeSettings(input.settings, type),
  };
}

export function normalizeGeneratedFormDraft(
  input: LooseGeneratedFormDraft,
): GeneratedFormDraft {
  const title = trimString(input.title) || DEFAULT_FORM_TITLE;
  const description = trimString(input.description) || DEFAULT_FORM_DESCRIPTION;
  const sourceFields = Array.isArray(input.fields) ? input.fields : [];
  const normalizedFields = sourceFields.map((field) =>
    normalizeField((field ?? {}) as LooseGeneratedFieldDraft),
  );

  return {
    title,
    description,
    fields:
      normalizedFields.length > 0
        ? normalizedFields
        : [
            normalizeField({
              type: "text",
              label: "Untitled question",
              description: "",
              placeholder: "",
              isRequired: false,
              width: "full",
              options: [],
              validation: {
                minLength: null,
                maxLength: null,
                min: null,
                max: null,
                pattern: null,
              },
              settings: {
                allowMultiple: null,
                defaultValue: null,
                ratingScale: null,
              },
            }),
          ],
  };
}

export const FORM_GENERATION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "fields"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    fields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "type",
          "label",
          "description",
          "placeholder",
          "isRequired",
          "width",
          "options",
          "validation",
          "settings",
        ],
        properties: {
          type: {
            type: "string",
            enum: [...SUPPORTED_FIELD_TYPES],
          },
          label: { type: "string" },
          description: { type: "string" },
          placeholder: { type: "string" },
          isRequired: { type: "boolean" },
          width: {
            type: "string",
            enum: [...SUPPORTED_WIDTHS],
          },
          options: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "value"],
              properties: {
                label: { type: "string" },
                value: { type: "string" },
              },
            },
          },
          validation: {
            type: "object",
            additionalProperties: false,
            required: ["minLength", "maxLength", "min", "max", "pattern"],
            properties: {
              minLength: { type: ["number", "null"] },
              maxLength: { type: ["number", "null"] },
              min: { type: ["number", "null"] },
              max: { type: ["number", "null"] },
              pattern: { type: ["string", "null"] },
            },
          },
          settings: {
            type: "object",
            additionalProperties: false,
            required: ["allowMultiple", "defaultValue", "ratingScale"],
            properties: {
              allowMultiple: { type: ["boolean", "null"] },
              defaultValue: { type: ["string", "null"] },
              ratingScale: { type: ["number", "null"] },
            },
          },
        },
      },
    },
  },
} as const;
