import type {
  FORM_FIELD_TYPE_VALUES,
  FORM_FIELD_WIDTH_VALUES,
  FORM_STATUS_VALUES,
  FORM_VISIBILITY_VALUES,
} from "./constants";

export type FormStatus = (typeof FORM_STATUS_VALUES)[number];
export type FormVisibility = (typeof FORM_VISIBILITY_VALUES)[number];
export type FormFieldType = (typeof FORM_FIELD_TYPE_VALUES)[number];
export type FormFieldWidth = (typeof FORM_FIELD_WIDTH_VALUES)[number];

export type FormFieldOption = {
  label: string;
  value: string;
};

export type FormFieldValidation = {
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  pattern?: string | null;
};

export type FormFieldSettings = {
  allowMultiple?: boolean | null;
  defaultValue?: string | null;
  ratingScale?: number | null;
};
