import { describe, expect, it } from "vitest";

import {
  formatSubmissionAnswer,
  validateSubmissionAnswers,
  type PublishedFormField,
} from "../../lib/forms/public-runtime";

const baseFields: PublishedFormField[] = [
  {
    fieldKey: "role",
    type: "select",
    label: "What is your role?",
    description: "",
    placeholder: "",
    isRequired: true,
    order: 0,
    width: "full",
    options: [
      { label: "Engineer", value: "engineer" },
      { label: "Designer", value: "designer" },
    ],
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
  },
  {
    fieldKey: "notes",
    type: "textarea",
    label: "Anything else?",
    description: "",
    placeholder: "",
    isRequired: false,
    order: 1,
    width: "full",
    options: [],
    validation: {
      minLength: 5,
      maxLength: 40,
      min: null,
      max: null,
      pattern: null,
    },
    settings: {
      allowMultiple: null,
      defaultValue: null,
      ratingScale: null,
    },
  },
  {
    fieldKey: "score",
    type: "rating",
    label: "Score",
    description: "",
    placeholder: "",
    isRequired: true,
    order: 2,
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
      ratingScale: 10,
    },
  },
  {
    fieldKey: "topics",
    type: "checkbox",
    label: "Topics",
    description: "",
    placeholder: "",
    isRequired: false,
    order: 3,
    width: "full",
    options: [
      { label: "Design", value: "design" },
      { label: "Product", value: "product" },
    ],
    validation: {
      minLength: null,
      maxLength: null,
      min: null,
      max: null,
      pattern: null,
    },
    settings: {
      allowMultiple: true,
      defaultValue: null,
      ratingScale: null,
    },
  },
  {
    fieldKey: "followUpDate",
    type: "date",
    label: "Follow-up date",
    description: "",
    placeholder: "",
    isRequired: false,
    order: 4,
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
  },
];

describe("validateSubmissionAnswers", () => {
  it("normalizes valid answers into snapshot-safe values", () => {
    const result = validateSubmissionAnswers(baseFields, {
      role: "engineer",
      notes: "  Helpful onboarding feedback  ",
      score: "9",
      topics: ["design", "product"],
      followUpDate: "2026-03-27",
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.values).toEqual({
      role: "engineer",
      notes: "Helpful onboarding feedback",
      score: 9,
      topics: ["design", "product"],
      followUpDate: "2026-03-27",
    });
  });

  it("returns field errors for invalid required and typed values", () => {
    const result = validateSubmissionAnswers(baseFields, {
      role: "",
      notes: "bad",
      score: 14,
      topics: ["design", "unknown"],
      followUpDate: "03/27/2026",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      role: "This field is required.",
      notes: "Enter at least 5 characters.",
      score: "Choose a rating between 1 and 10.",
      topics: "Choose only the provided options.",
      followUpDate: "Enter a valid date.",
    });
  });

  it("ignores unknown answer keys instead of storing them", () => {
    const result = validateSubmissionAnswers(baseFields, {
      role: "designer",
      score: 7,
      admin: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.values).toEqual({
      role: "designer",
      score: 7,
    });
  });
});

describe("formatSubmissionAnswer", () => {
  it("formats arbitrary submission values for the responses table", () => {
    expect(formatSubmissionAnswer(baseFields[0], "engineer")).toBe("Engineer");
    expect(formatSubmissionAnswer(baseFields[3], ["design", "product"]))
      .toBe("Design, Product");
    expect(formatSubmissionAnswer(baseFields[2], 8)).toBe("8 / 10");
    expect(formatSubmissionAnswer(baseFields[4], "2026-03-27")).toBe("2026-03-27");
  });
});
