"use node";

import { ConvexError, v } from "convex/values";

import {
  FORM_GENERATION_JSON_SCHEMA,
  normalizeGeneratedFormDraft,
} from "../lib/ai/form-schema";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { AI_MODEL, AI_PROMPT_CHAR_LIMIT, normalizeGenerationPrompt } from "./lib/ai";
import { requireIdentity } from "./lib/auth";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

class AiGenerationError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AiGenerationError";
    this.code = code;
  }
}

function requireGroqApiKey(): string {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new AiGenerationError(
      "config_error",
      "AI draft generation is not configured yet. Add GROQ_API_KEY to the Convex deployment.",
    );
  }

  return groqApiKey;
}

function getResponseTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((block) => {
      if (typeof block !== "object" || block === null) {
        return "";
      }

      if ((block as { type?: unknown }).type !== "text") {
        return "";
      }

      return typeof (block as { text?: unknown }).text === "string"
        ? ((block as { text: string }).text ?? "")
        : "";
    })
    .join("");
}

function getFailureInfo(error: unknown): { code: string; message: string } {
  if (error instanceof AiGenerationError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      code: "generation_failed",
      message: error.message,
    };
  }

  return {
    code: "generation_failed",
    message: "AI draft generation failed. Please try again.",
  };
}

async function generateStructuredDraft(prompt: string) {
  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireGroqApiKey()}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You generate practical form drafts for a form builder. Use only supported field types: text, textarea, select, radio, checkbox, rating, and date. Prefer 4 to 8 clear questions unless the prompt strongly implies otherwise. Return only schema-compliant data.",
        },
        {
          role: "user",
          content: `Create a form draft from this prompt:\n\n${prompt}\n\nThe prompt is capped at ${AI_PROMPT_CHAR_LIMIT} characters and the output must stay directly editable in a basic form builder.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "form_draft",
          strict: true,
          schema: FORM_GENERATION_JSON_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new AiGenerationError(
      "groq_http_error",
      responseText
        ? `Groq request failed (${response.status}): ${responseText.slice(0, 300)}`
        : `Groq request failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };
  const content = getResponseTextContent(payload.choices?.[0]?.message?.content).trim();

  if (!content) {
    throw new AiGenerationError(
      "groq_invalid_response",
      "Groq returned an empty response for this draft request.",
    );
  }

  let parsedContent: unknown;

  try {
    parsedContent = JSON.parse(content);
  } catch {
    throw new AiGenerationError(
      "groq_parse_error",
      "Groq returned invalid JSON for this draft request.",
    );
  }

  return normalizeGeneratedFormDraft(parsedContent as Parameters<typeof normalizeGeneratedFormDraft>[0]);
}

type BeginGenerationResult =
  | {
      ok: true;
      jobId: Id<"aiGenerationJobs">;
    }
  | {
      ok: false;
      jobId: Id<"aiGenerationJobs">;
      errorCode: string;
      errorMessage: string;
    };

export const generateDraft = action({
  args: {
    prompt: v.string(),
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args): Promise<{ formId: Id<"forms"> }> => {
    requireIdentity(await ctx.auth.getUserIdentity());
    const normalizedPrompt = normalizeGenerationPrompt(args.prompt);
    const job: BeginGenerationResult = await ctx.runMutation(internal.ai.beginGeneration, {
      clerkOrgId: args.clerkOrgId,
      prompt: args.prompt,
      normalizedPrompt,
    });

    if (!job.ok) {
      throw new ConvexError({
        type: "rate_limit",
        code: job.errorCode,
        message:
          job.errorCode === "user_burst_limit"
            ? "You’re generating too quickly. Please try again in a moment."
            : "AI generation is temporarily unavailable. Please try again later.",
      });
    }

    try {
      const draft = await generateStructuredDraft(normalizedPrompt);

      return await ctx.runMutation(internal.ai.completeGenerationSuccess, {
        jobId: job.jobId,
        title: draft.title,
        description: draft.description,
        fields: draft.fields,
      });
    } catch (error) {
      const failure = getFailureInfo(error);
      await ctx.runMutation(internal.ai.markGenerationFailed, {
        jobId: job.jobId,
        failureCode: failure.code,
        failureMessage: failure.message,
      });
      throw new ConvexError({
        type: "generation_failed",
        code: failure.code,
        message: "We couldn’t generate a draft right now. Please try again.",
      });
    }
  },
});
