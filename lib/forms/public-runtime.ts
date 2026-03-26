import type {
  FormFieldOption,
  FormFieldSettings,
  FormFieldType,
  FormFieldValidation,
  FormFieldWidth,
} from "./types";

export type PublishedFormField = {
  fieldKey: string;
  type: FormFieldType;
  label: string;
  description: string;
  placeholder: string;
  isRequired: boolean;
  order: number;
  width: FormFieldWidth;
  options: FormFieldOption[];
  validation: Required<FormFieldValidation>;
  settings: Required<FormFieldSettings>;
};

export type SubmissionValue = string | number | string[];

type SubmissionValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
  values: Record<string, SubmissionValue>;
};

function getOptionLabel(field: PublishedFormField, value: string): string {
  return field.options.find((option) => option.value === value)?.label ?? value;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function getSpecificPatternError(field: PublishedFormField): string {
  const context = `${field.label} ${field.placeholder} ${field.description}`.toLowerCase();

  if (context.includes("email")) {
    return "Enter a valid email address, for example name@example.com.";
  }

  if (context.includes("phone") || context.includes("mobile") || context.includes("whatsapp")) {
    return "Enter a valid phone number, including country code if needed.";
  }

  if (context.includes("year") || context.includes("experience") || context.includes("number")) {
    return "Enter a valid number.";
  }

  if (context.includes("url") || context.includes("website") || context.includes("link")) {
    return "Enter a valid URL, including https:// if required.";
  }

  return "Enter a valid value in the expected format.";
}

export function validateSubmissionAnswers(
  fields: PublishedFormField[],
  answers: Record<string, unknown>,
): SubmissionValidationResult {
  const errors: Record<string, string> = {};
  const values: Record<string, SubmissionValue> = {};

  for (const field of fields) {
    const rawValue = answers[field.fieldKey];

    if (field.type === "checkbox") {
      const nextValue = Array.isArray(rawValue)
        ? rawValue.filter((value): value is string => typeof value === "string")
        : [];

      if (field.isRequired && nextValue.length === 0) {
        errors[field.fieldKey] = "This field is required.";
        continue;
      }

      if (nextValue.length === 0) {
        continue;
      }

      const allowedValues = new Set(field.options.map((option) => option.value));
      if (nextValue.some((value) => !allowedValues.has(value))) {
        errors[field.fieldKey] = "Choose only the provided options.";
        continue;
      }

      values[field.fieldKey] = nextValue;
      continue;
    }

    if (field.type === "rating") {
      const numericValue =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string" && rawValue.trim()
            ? Number(rawValue)
            : null;
      const maxRating = field.settings.ratingScale ?? 5;

      if (numericValue === null || Number.isNaN(numericValue)) {
        if (field.isRequired) {
          errors[field.fieldKey] = "This field is required.";
        }
        continue;
      }

      if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > maxRating) {
        errors[field.fieldKey] = `Choose a rating between 1 and ${maxRating}.`;
        continue;
      }

      values[field.fieldKey] = numericValue;
      continue;
    }

    const stringValue = typeof rawValue === "string" ? rawValue.trim() : "";

    if (!stringValue) {
      if (field.isRequired) {
        errors[field.fieldKey] = "This field is required.";
      }
      continue;
    }

    if (field.type === "select" || field.type === "radio") {
      const allowedValues = new Set(field.options.map((option) => option.value));

      if (!allowedValues.has(stringValue)) {
        errors[field.fieldKey] = "Choose one of the provided options.";
        continue;
      }
    }

    if ((field.type === "text" || field.type === "textarea") && field.validation.minLength) {
      if (stringValue.length < field.validation.minLength) {
        errors[field.fieldKey] = `Enter at least ${field.validation.minLength} characters.`;
        continue;
      }
    }

    if ((field.type === "text" || field.type === "textarea") && field.validation.maxLength) {
      if (stringValue.length > field.validation.maxLength) {
        errors[field.fieldKey] = `Enter no more than ${field.validation.maxLength} characters.`;
        continue;
      }
    }

    if (
      (field.type === "text" || field.type === "textarea") &&
      field.validation.pattern &&
      !new RegExp(field.validation.pattern).test(stringValue)
    ) {
      errors[field.fieldKey] = getSpecificPatternError(field);
      continue;
    }

    if (field.type === "date" && !isIsoDate(stringValue)) {
      errors[field.fieldKey] = "Enter a valid date.";
      continue;
    }

    values[field.fieldKey] = stringValue;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values,
  };
}

export function formatSubmissionAnswer(
  field: PublishedFormField,
  value: unknown,
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (field.type === "checkbox" && Array.isArray(value)) {
    if (value.length === 0) {
      return "-";
    }

    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => getOptionLabel(field, entry))
      .join(", ");
  }

  if ((field.type === "select" || field.type === "radio") && typeof value === "string") {
    return getOptionLabel(field, value);
  }

  if (field.type === "rating" && typeof value === "number") {
    return `${value} / ${field.settings.ratingScale ?? 5}`;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "-";
}
