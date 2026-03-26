import { formatSubmissionAnswer, type PublishedFormField } from "./public-runtime";

type CsvSubmission = {
  submittedAt: number;
  answers: Record<string, unknown>;
};

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function buildResponsesCsv(input: {
  fields: PublishedFormField[];
  submissions: CsvSubmission[];
}): string {
  const header = ["Submitted At", ...input.fields.map((field) => field.label)];
  const rows = input.submissions.map((submission) => [
    new Date(submission.submittedAt).toISOString(),
    ...input.fields.map((field) => {
      const value = submission.answers[field.fieldKey] as
        | string
        | number
        | string[]
        | undefined
        | null;

      if (value === undefined || value === null) {
        return "";
      }

      return formatSubmissionAnswer(field, value);
    }),
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsvCell(value)).join(","))
    .join("\n");
}

export function getResponsesCsvFilename(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "form"}-responses.csv`;
}
