import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const AI_PROVIDER = "groq";
export const AI_MODEL = "openai/gpt-oss-20b";
export const AI_PROMPT_CHAR_LIMIT = 1500;
export const USER_BURST_WINDOW_MS = 60 * 1000;
export const USER_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
export const USER_BURST_LIMIT = 1;
export const USER_DAILY_LIMIT = 5;
export const WORKSPACE_DAILY_LIMIT = 20;

type RecentJob = {
  createdAt: number;
};

type RateLimitCtx = MutationCtx | QueryCtx;

export function normalizeGenerationPrompt(prompt: string): string {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("Enter a prompt to generate a draft.");
  }

  if (normalizedPrompt.length > AI_PROMPT_CHAR_LIMIT) {
    throw new Error(`Prompt must be ${AI_PROMPT_CHAR_LIMIT} characters or less.`);
  }

  return normalizedPrompt;
}

async function countRecentJobs(
  jobs: AsyncIterable<RecentJob>,
  now: number,
): Promise<{ burstCount: number; dailyCount: number }> {
  const burstThreshold = now - USER_BURST_WINDOW_MS;
  const dailyThreshold = now - USER_DAILY_WINDOW_MS;
  let burstCount = 0;
  let dailyCount = 0;

  for await (const job of jobs) {
    if (job.createdAt < dailyThreshold) {
      break;
    }

    dailyCount += 1;

    if (job.createdAt >= burstThreshold) {
      burstCount += 1;
    }
  }

  return { burstCount, dailyCount };
}

export async function getUserGenerationUsage(
  ctx: RateLimitCtx,
  userId: Id<"users">,
  now: number,
) {
  return await countRecentJobs(
    ctx.db
      .query("aiGenerationJobs")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc"),
    now,
  );
}

export async function getWorkspaceDailyGenerationUsage(
  ctx: RateLimitCtx,
  workspaceId: Id<"workspaces">,
  now: number,
): Promise<number> {
  const dailyThreshold = now - USER_DAILY_WINDOW_MS;
  let dailyCount = 0;

  for await (const job of ctx.db
    .query("aiGenerationJobs")
    .withIndex("by_workspaceId_and_createdAt", (q) => q.eq("workspaceId", workspaceId))
    .order("desc")) {
    if (job.createdAt < dailyThreshold) {
      break;
    }

    dailyCount += 1;
  }

  return dailyCount;
}
