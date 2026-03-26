import type { UserIdentity } from "convex/server";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export function requireIdentity(identity: UserIdentity | null): UserIdentity {
  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity;
}

export function getPersonalWorkspaceKey(clerkUserId: string): string {
  return `user:${clerkUserId}`;
}

export function getOrganizationWorkspaceKey(clerkOrgId: string): string {
  return `org:${clerkOrgId}`;
}

export function getCurrentWorkspaceKey(
  identity: UserIdentity,
  clerkOrgId: string | null,
): string {
  return clerkOrgId
    ? getOrganizationWorkspaceKey(clerkOrgId)
    : getPersonalWorkspaceKey(identity.subject);
}

export function normalizeWorkspaceSlug(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return normalized || "workspace";
}

export async function getCurrentUserRecord(
  ctx: AuthCtx,
): Promise<Doc<"users"> | null> {
  const identity = requireIdentity(await ctx.auth.getUserIdentity());

  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export async function requireCurrentUser(ctx: AuthCtx): Promise<Doc<"users">> {
  const user = await getCurrentUserRecord(ctx);

  if (!user) {
    throw new Error("User not synced");
  }

  return user;
}

export async function getWorkspaceByKey(
  ctx: AuthCtx,
  workspaceKey: string,
): Promise<Doc<"workspaces"> | null> {
  return await ctx.db
    .query("workspaces")
    .withIndex("by_workspaceKey", (q) => q.eq("workspaceKey", workspaceKey))
    .unique();
}

export async function requireActiveWorkspace(
  ctx: AuthCtx,
  clerkOrgId: string | null,
): Promise<Doc<"workspaces">> {
  const identity = requireIdentity(await ctx.auth.getUserIdentity());
  const workspaceKey = getCurrentWorkspaceKey(identity, clerkOrgId);
  const workspace = await getWorkspaceByKey(ctx, workspaceKey);

  if (!workspace) {
    throw new Error("Workspace not synced");
  }

  return workspace;
}

export async function requireWorkspaceAccess(
  ctx: AuthCtx,
  workspaceId: Id<"workspaces">,
  clerkOrgId: string | null,
): Promise<Doc<"workspaces">> {
  const workspace = await requireActiveWorkspace(ctx, clerkOrgId);

  if (workspace._id !== workspaceId) {
    throw new Error("Unauthorized");
  }

  return workspace;
}

type UserSyncInput = {
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  defaultWorkspaceKey: string | null;
};

export async function upsertCurrentUser(
  ctx: MutationCtx,
  input: UserSyncInput,
): Promise<Doc<"users">> {
  const identity = requireIdentity(await ctx.auth.getUserIdentity());
  const now = Date.now();
  const existing = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      clerkUserId: identity.subject,
      email: input.email,
      name: input.name,
      imageUrl: input.imageUrl,
      defaultWorkspaceKey: input.defaultWorkspaceKey,
      updatedAt: now,
    });

    return {
      ...existing,
      clerkUserId: identity.subject,
      email: input.email,
      name: input.name,
      imageUrl: input.imageUrl,
      defaultWorkspaceKey: input.defaultWorkspaceKey,
      updatedAt: now,
    };
  }

  const userId = await ctx.db.insert("users", {
    tokenIdentifier: identity.tokenIdentifier,
    clerkUserId: identity.subject,
    email: input.email,
    name: input.name,
    imageUrl: input.imageUrl,
    defaultWorkspaceKey: input.defaultWorkspaceKey,
    createdAt: now,
    updatedAt: now,
  });
  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}
