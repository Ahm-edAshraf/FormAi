"use client";

import { useMutation, useQuery } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { PublishedFormField, SubmissionValue } from "@/lib/forms/public-runtime";

function getEmptyValue(field: PublishedFormField): SubmissionValue | "" {
  if (field.type === "checkbox") {
    return [];
  }

  return "";
}

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const publicForm = useQuery(api.formSnapshots.getPublicBySlug, { slug });
  const submitPublic = useMutation(api.submissions.submitPublic);
  const trackPublicView = useMutation(api.formSnapshots.trackPublicView);
  const [answers, setAnswers] = useState<Record<string, SubmissionValue | "">>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const snapshotId = publicForm?.snapshot?._id ?? null;

  const fields = useMemo(() => publicForm?.snapshot.fields ?? [], [publicForm?.snapshot.fields]);

  useEffect(() => {
    if (!snapshotId) {
      return;
    }

    const storageKey = `formai:view:${snapshotId}`;

    if (window.localStorage.getItem(storageKey) === "tracked") {
      return;
    }

    void trackPublicView({
      snapshotId: snapshotId as Id<"formSnapshots">,
    })
      .then(() => {
        window.localStorage.setItem(storageKey, "tracked");
      })
      .catch(() => {});
  }, [snapshotId, trackPublicView]);

  useEffect(() => {
    if (fields.length === 0) {
      return;
    }

    setAnswers((current) => {
      const next = { ...current };

      for (const field of fields) {
        if (!(field.fieldKey in next)) {
          next[field.fieldKey] = getEmptyValue(field);
        }
      }

      return next;
    });
  }, [fields]);

  if (isSubmitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 font-sans">
        <div className="w-full max-w-md animate-in zoom-in-95 space-y-6 text-center duration-500">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Thank you!</h1>
          <p className="text-slate-400">Your response has been successfully submitted.</p>
        </div>
      </main>
    );
  }

  if (publicForm === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 font-sans text-sm text-slate-400">
        Loading form...
      </main>
    );
  }

  if (!publicForm || !snapshotId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">Form unavailable</h1>
          <p className="mt-3 text-sm text-slate-400">
            This form is not published right now.
          </p>
        </div>
      </main>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    try {
      if (!snapshotId) {
        throw new Error("Published form not found");
      }

      await submitPublic({
        snapshotId: snapshotId as Id<"formSnapshots">,
        answers,
      });
      setIsSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submission failed";

      try {
        setErrors(JSON.parse(message) as Record<string, string>);
      } catch {
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-12 font-sans selection:bg-indigo-500/30 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {publicForm.snapshot.title}
          </h1>
          {publicForm.snapshot.description ? (
            <p className="text-lg text-slate-400">{publicForm.snapshot.description}</p>
          ) : null}
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-8 rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl sm:p-10"
        >
          {fields.map((field) => {
            const value = answers[field.fieldKey] ?? getEmptyValue(field);
            const error = errors[field.fieldKey];

            return (
              <div key={field.fieldKey} className="group space-y-3">
                <label className="block text-sm font-medium text-slate-200 transition-colors group-focus-within:text-indigo-400">
                  {field.label}
                  {field.isRequired ? <span className="text-red-400"> *</span> : null}
                </label>
                {field.description ? (
                  <p className="text-sm text-slate-500">{field.description}</p>
                ) : null}

                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={typeof value === "string" ? value : ""}
                    placeholder={field.placeholder || "Type your answer here..."}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [field.fieldKey]: event.target.value,
                      }))
                    }
                    className="w-full resize-y rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-slate-600 transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                ) : null}

                {field.type === "text" ? (
                  <input
                    type="text"
                    value={typeof value === "string" ? value : ""}
                    placeholder={field.placeholder || "Type your answer here..."}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [field.fieldKey]: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-slate-600 transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                ) : null}

                {field.type === "date" ? (
                  <input
                    type="date"
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [field.fieldKey]: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                ) : null}

                {field.type === "select" ? (
                  <select
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [field.fieldKey]: event.target.value,
                      }))
                    }
                    className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 text-white transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  >
                    <option value="">Select an option...</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}

                {field.type === "radio" ? (
                  <div className="flex flex-wrap gap-3">
                    {field.options.map((option) => (
                      <label key={option.value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name={field.fieldKey}
                          value={option.value}
                          checked={value === option.value}
                          onChange={(event) =>
                            setAnswers((current) => ({
                              ...current,
                              [field.fieldKey]: event.target.value,
                            }))
                          }
                          className="peer sr-only"
                        />
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-600 peer-checked:text-white peer-hover:border-white/30">
                          {option.label}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : null}

                {field.type === "checkbox" ? (
                  <div className="space-y-3">
                    {field.options.map((option) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const checked = currentValues.includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition-all hover:border-white/20"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              setAnswers((current) => {
                                const previous = Array.isArray(current[field.fieldKey])
                                  ? (current[field.fieldKey] as string[])
                                  : [];

                                return {
                                  ...current,
                                  [field.fieldKey]: event.target.checked
                                    ? [...previous, option.value]
                                    : previous.filter((entry) => entry !== option.value),
                                };
                              })
                            }
                            className="h-4 w-4 rounded border-white/20 bg-transparent text-indigo-500"
                          />
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}

                {field.type === "rating" ? (
                  <>
                    <div className="flex flex-wrap gap-3">
                      {Array.from({ length: field.settings.ratingScale ?? 5 }, (_, index) => index + 1).map(
                        (rating) => (
                          <label key={rating} className="relative cursor-pointer">
                            <input
                              type="radio"
                              name={field.fieldKey}
                              value={rating}
                              checked={value === rating || value === String(rating)}
                              onChange={(event) =>
                                setAnswers((current) => ({
                                  ...current,
                                  [field.fieldKey]: Number(event.target.value),
                                }))
                              }
                              className="peer sr-only"
                            />
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-600 peer-checked:text-white peer-hover:border-white/30">
                              {rating}
                            </div>
                          </label>
                        ),
                      )}
                    </div>
                    <div className="flex justify-between px-1 pt-1 text-xs text-slate-500">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </>
                ) : null}

                {error ? <p className="text-sm text-red-400">{error}</p> : null}
              </div>
            );
          })}

          {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

          <div className="border-t border-white/10 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-14 w-full rounded-xl bg-white text-lg font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <p className="font-mono text-xs text-slate-600">
            Powered by <span className="font-sans font-medium text-slate-400">FormAI</span>
          </p>
        </div>
      </div>
    </main>
  );
}
