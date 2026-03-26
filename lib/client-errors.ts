import { ConvexError } from "convex/values";

type KnownErrorPayload = {
  type?: string;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function getErrorData(error: unknown): KnownErrorPayload | null {
  if (error instanceof ConvexError) {
    return (error.data as KnownErrorPayload) ?? null;
  }

  if (error && typeof error === "object" && "data" in error) {
    return ((error as { data?: KnownErrorPayload }).data as KnownErrorPayload) ?? null;
  }

  return null;
}

export function getSafeActionMessage(error: unknown, fallback: string): string {
  const data = getErrorData(error);

  if (!data) {
    return fallback;
  }

  if (data.type === "rate_limit") {
    return data.message ?? "You’re doing that a little too quickly. Please try again shortly.";
  }

  if (data.type === "validation_error") {
    return data.message ?? fallback;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  return fallback;
}
