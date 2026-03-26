import { describe, expect, it } from "vitest";

import { buildResponsesCsv, getResponsesCsvFilename } from "../../lib/forms/responses-export";
import type { PublishedFormField } from "../../lib/forms/public-runtime";

const fields: PublishedFormField[] = [
  {
    fieldKey: "name",
    type: "text",
    label: "Full Name",
    description: "",
    placeholder: "",
    isRequired: true,
    order: 0,
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
  {
    fieldKey: "role",
    type: "select",
    label: "Role",
    description: "",
    placeholder: "",
    isRequired: false,
    order: 1,
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
    fieldKey: "topics",
    type: "checkbox",
    label: "Topics",
    description: "",
    placeholder: "",
    isRequired: false,
    order: 2,
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
];

describe("buildResponsesCsv", () => {
  it("serializes submitted responses with escaped values", () => {
    const csv = buildResponsesCsv({
      fields,
      submissions: [
        {
          submittedAt: 1767225600000,
          answers: {
            name: 'Ada "A." Lovelace',
            role: "engineer",
            topics: ["design", "product"],
          },
        },
        {
          submittedAt: 1767312000000,
          answers: {
            name: "Grace\nHopper",
            role: "designer",
          },
        },
      ],
    });

    expect(csv).toBe([
      'Submitted At,Full Name,Role,Topics',
      '2026-01-01T00:00:00.000Z,"Ada ""A."" Lovelace",Engineer,"Design, Product"',
      '2026-01-02T00:00:00.000Z,"Grace\nHopper",Designer,',
    ].join("\n"));
  });
});

describe("getResponsesCsvFilename", () => {
  it("normalizes form titles into download-safe filenames", () => {
    expect(getResponsesCsvFilename("Customer Feedback / Q1")).toBe(
      "customer-feedback-q1-responses.csv",
    );
  });
});
