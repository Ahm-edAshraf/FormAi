"use client";

import { ConvexError } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  validateSubmissionAnswers,
  type PublishedFormField,
  type SubmissionValue,
} from "@/lib/forms/public-runtime";

type ValidationErrorPayload = {
  type: "validation_error";
  fieldErrors: Record<string, string>;
};

function getValidationPayload(error: unknown): ValidationErrorPayload | null {
  if (!(error instanceof ConvexError) && (!error || typeof error !== "object")) {
    return null;
  }

  const data = error instanceof ConvexError ? error.data : (error as { data?: unknown }).data;

  if (
    !data ||
    typeof data !== "object" ||
    (data as { type?: unknown }).type !== "validation_error" ||
    typeof (data as { fieldErrors?: unknown }).fieldErrors !== "object" ||
    (data as { fieldErrors?: unknown }).fieldErrors === null
  ) {
    return null;
  }

  return {
    type: "validation_error",
    fieldErrors: (data as { fieldErrors: Record<string, string> }).fieldErrors,
  };
}

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
  const trackSubmissionStart = useMutation(api.analytics.trackSubmissionStart);
  const [answers, setAnswers] = useState<Record<string, SubmissionValue | "">>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const snapshotId = publicForm?.snapshot?._id ?? null;
  const sessionIdRef = useRef<string | null>(null);
  const hasTrackedStartRef = useRef(false);

  const fields = useMemo(() => publicForm?.snapshot.fields ?? [], [publicForm?.snapshot.fields]);
  const validationSummary = useMemo(
    () =>
      fields
        .filter((field) => errors[field.fieldKey])
        .map((field) => ({
          fieldKey: field.fieldKey,
          label: field.label,
          message: errors[field.fieldKey],
        })),
    [errors, fields],
  );

  useEffect(() => {
    if (!snapshotId) {
      sessionIdRef.current = null;
      hasTrackedStartRef.current = false;
      return;
    }

    const storageKey = `formai:session:${snapshotId}`;
    let sessionId = window.sessionStorage.getItem(storageKey);

    if (!sessionId) {
      sessionId = window.crypto.randomUUID();
      window.sessionStorage.setItem(storageKey, sessionId);
    }

    sessionIdRef.current = sessionId;
    hasTrackedStartRef.current = false;
  }, [snapshotId]);

  const ensureStartTracked = () => {
    if (!snapshotId || !sessionIdRef.current || hasTrackedStartRef.current) {
      return;
    }

    hasTrackedStartRef.current = true;
    void trackSubmissionStart({
      snapshotId: snapshotId as Id<"formSnapshots">,
      sessionId: sessionIdRef.current,
    }).catch(() => {
      hasTrackedStartRef.current = false;
    });
  };

  useEffect(() => {
    if (!snapshotId || !sessionIdRef.current) {
      return;
    }

    const storageKey = `formai:view:${snapshotId}:${sessionIdRef.current}`;

    if (window.localStorage.getItem(storageKey) === "tracked") {
      return;
    }

    void trackPublicView({
      snapshotId: snapshotId as Id<"formSnapshots">,
      sessionId: sessionIdRef.current,
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
      <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 font-sans relative overflow-hidden">
        {/* Success Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>
        
        <div className="w-full max-w-md animate-in zoom-in-95 space-y-6 text-center duration-500 relative z-10 p-10 rounded-3xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl shadow-2xl">
          <div className="mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_40px_rgba(52,211,153,0.2)]">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Thank you!</h1>
          <p className="text-slate-400 text-lg">
            {publicForm?.snapshot.successMessage ?? "Your response has been successfully submitted."}
          </p>
          <div className="pt-6">
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setAnswers({});
                if (snapshotId) {
                  const nextSessionId = window.crypto.randomUUID();
                  window.sessionStorage.setItem(`formai:session:${snapshotId}`, nextSessionId);
                  sessionIdRef.current = nextSessionId;
                }
                hasTrackedStartRef.current = false;
              }}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Submit another response
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (publicForm === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 font-sans relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400 tracking-widest uppercase">Loading Form</p>
        </div>
      </main>
    );
  }

  if (!publicForm || !snapshotId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>
        
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl p-10 text-center relative z-10 shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Lock className="h-8 w-8 text-slate-400" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-3">Form Unavailable</h1>
          <p className="text-slate-400 leading-relaxed">
            This form is currently not accepting responses. It may have been unpublished or deleted by the owner.
          </p>
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 font-mono">Powered by FormAI</p>
          </div>
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

      const localValidation = validateSubmissionAnswers(fields, answers);

      if (!localValidation.isValid) {
        setErrors(localValidation.errors);
        setSubmitError("Please fix the highlighted fields below.");
        const firstFieldKey = Object.keys(localValidation.errors)[0];
        if (firstFieldKey) {
          window.requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>(`[data-field-key="${CSS.escape(firstFieldKey)}"]`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }
        return;
      }

      await submitPublic({
        snapshotId: snapshotId as Id<"formSnapshots">,
        sessionId: sessionIdRef.current ?? window.crypto.randomUUID(),
        answers: localValidation.values,
      });
      setIsSubmitted(true);
    } catch (error) {
      const validationPayload = getValidationPayload(error);

      if (validationPayload) {
        setErrors(validationPayload.fieldErrors ?? {});
        setSubmitError("Please fix the highlighted fields below.");
        const firstFieldKey = Object.keys(validationPayload.fieldErrors ?? {})[0];
        if (firstFieldKey) {
          window.requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>(`[data-field-key="${CSS.escape(firstFieldKey)}"]`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }
      } else {
        setSubmitError("We couldn’t submit your response. Please review the form and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearFieldError(fieldKey: string) {
    setErrors((current) => {
      if (!current[fieldKey]) {
        return current;
      }

      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
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
              <div key={field.fieldKey} data-field-key={field.fieldKey} className="group space-y-3">
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
                    onChange={(event) => {
                      ensureStartTracked();
                      clearFieldError(field.fieldKey);
                      setAnswers((current) => ({
                        ...current,
                        [field.fieldKey]: event.target.value,
                      }));
                    }}
                    className={`w-full resize-y rounded-xl border bg-white/5 p-4 text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-1 ${
                      error
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/40"
                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                    }`}
                  />
                ) : null}

                {field.type === "text" ? (
                  <input
                    type="text"
                    value={typeof value === "string" ? value : ""}
                    placeholder={field.placeholder || "Type your answer here..."}
                    onChange={(event) => {
                      ensureStartTracked();
                      clearFieldError(field.fieldKey);
                      setAnswers((current) => ({
                        ...current,
                        [field.fieldKey]: event.target.value,
                      }));
                    }}
                    className={`h-12 w-full rounded-xl border bg-white/5 px-4 text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-1 ${
                      error
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/40"
                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                    }`}
                  />
                ) : null}

                {field.type === "date" ? (
                  <input
                    type="date"
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) => {
                      ensureStartTracked();
                      clearFieldError(field.fieldKey);
                      setAnswers((current) => ({
                        ...current,
                        [field.fieldKey]: event.target.value,
                      }));
                    }}
                    className={`h-12 w-full rounded-xl border bg-white/5 px-4 text-white transition-all focus:outline-none focus:ring-1 ${
                      error
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/40"
                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                    }`}
                  />
                ) : null}

                {field.type === "select" ? (
                  <select
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) => {
                      ensureStartTracked();
                      clearFieldError(field.fieldKey);
                      setAnswers((current) => ({
                        ...current,
                        [field.fieldKey]: event.target.value,
                      }));
                    }}
                    className={`h-12 w-full appearance-none rounded-xl border bg-white/5 px-4 text-white transition-all focus:outline-none focus:ring-1 ${
                      error
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/40"
                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                    }`}
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
                          onChange={(event) => {
                            ensureStartTracked();
                            clearFieldError(field.fieldKey);
                            setAnswers((current) => ({
                              ...current,
                              [field.fieldKey]: event.target.value,
                            }));
                          }}
                          className="peer sr-only"
                        />
                        <div className={`rounded-xl border bg-white/5 px-4 py-3 text-sm transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-600 peer-checked:text-white peer-hover:border-white/30 ${
                          error ? "border-red-500/40 text-slate-300" : "border-white/10 text-slate-400"
                        }`}>
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
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white/5 px-4 py-3 text-sm text-slate-300 transition-all hover:border-white/20 ${
                            error ? "border-red-500/40" : "border-white/10"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              ensureStartTracked();
                              clearFieldError(field.fieldKey);
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
                              });
                            }}
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
                                onChange={(event) => {
                                  ensureStartTracked();
                                  clearFieldError(field.fieldKey);
                                  setAnswers((current) => ({
                                    ...current,
                                    [field.fieldKey]: Number(event.target.value),
                                  }));
                                }}
                               className="peer sr-only"
                             />
                             <div className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-white/5 text-slate-400 transition-all peer-checked:border-indigo-500 peer-checked:bg-indigo-600 peer-checked:text-white peer-hover:border-white/30 ${
                               error ? "border-red-500/40" : "border-white/10"
                             }`}>
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

          {submitError ? (
            <div className="msg-error space-y-3">
              <p>{submitError}</p>
              {validationSummary.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {validationSummary.map((item) => (
                    <li key={item.fieldKey}>
                      <span className="font-medium text-red-100">{item.label}:</span> {item.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

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
