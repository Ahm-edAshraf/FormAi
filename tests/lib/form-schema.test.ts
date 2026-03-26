import { describe, expect, it } from "vitest";

import {
  FORM_GENERATION_JSON_SCHEMA,
  normalizeGeneratedFormDraft,
} from "../../lib/ai/form-schema";

describe("normalizeGeneratedFormDraft", () => {
  it("coerces model output into builder-safe fields", () => {
    const draft = normalizeGeneratedFormDraft({
      title: " Customer feedback form ",
      description: " Learn what customers think. ",
      fields: [
        {
          type: "select",
          label: " What is your role? ",
          description: " optional ",
          placeholder: " pick one ",
          isRequired: true,
          width: "half",
          options: [
            { label: " Engineer ", value: "" },
            { label: " Designer ", value: " product designer " },
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
          type: "unsupported",
          label: "",
          description: "",
          placeholder: "",
          isRequired: false,
          width: "weird",
          options: [],
          validation: {
            minLength: 2,
            maxLength: 1,
            min: 10,
            max: 3,
            pattern: "",
          },
          settings: {
            allowMultiple: true,
            defaultValue: "  ",
            ratingScale: 12,
          },
        },
      ],
    });

    expect(draft.title).toBe("Customer feedback form");
    expect(draft.description).toBe("Learn what customers think.");
    expect(draft.fields).toHaveLength(2);
    expect(draft.fields[0]).toMatchObject({
      type: "select",
      label: "What is your role?",
      description: "optional",
      placeholder: "pick one",
      isRequired: true,
      width: "half",
      options: [
        { label: "Engineer", value: "engineer" },
        { label: "Designer", value: "product-designer" },
      ],
      settings: {
        allowMultiple: null,
        defaultValue: null,
        ratingScale: null,
      },
    });
    expect(draft.fields[1]).toMatchObject({
      type: "text",
      label: "Untitled question",
      width: "full",
      options: [],
      validation: {
        minLength: 2,
        maxLength: null,
        min: 10,
        max: null,
        pattern: null,
      },
      settings: {
        allowMultiple: null,
        defaultValue: null,
        ratingScale: null,
      },
    });
  });

  it("adds a fallback field when the model returns none", () => {
    const draft = normalizeGeneratedFormDraft({
      title: "Lead capture",
      description: "",
      fields: [],
    });

    expect(draft.fields).toHaveLength(1);
    expect(draft.fields[0]).toMatchObject({
      type: "text",
      label: "Untitled question",
      options: [],
    });
  });
});

describe("FORM_GENERATION_JSON_SCHEMA", () => {
  it("marks every object as strict for Groq structured outputs", () => {
    expect(FORM_GENERATION_JSON_SCHEMA.type).toBe("object");
    expect(FORM_GENERATION_JSON_SCHEMA.additionalProperties).toBe(false);
    expect(FORM_GENERATION_JSON_SCHEMA.required).toEqual([
      "title",
      "description",
      "fields",
    ]);

    const fieldSchema = FORM_GENERATION_JSON_SCHEMA.properties.fields.items;
    expect(fieldSchema.additionalProperties).toBe(false);
    expect(fieldSchema.required).toEqual([
      "type",
      "label",
      "description",
      "placeholder",
      "isRequired",
      "width",
      "options",
      "validation",
      "settings",
    ]);
  });
});
