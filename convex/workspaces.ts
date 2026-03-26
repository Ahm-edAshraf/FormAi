import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  getCurrentWorkspaceKey,
  getWorkspaceByKey,
  normalizeWorkspaceSlug,
  requireIdentity,
  requireWorkspaceAccess,
  upsertCurrentUser,
} from "./lib/auth";

export const getCurrent = query({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = requireIdentity(await ctx.auth.getUserIdentity());
    const workspaceKey = getCurrentWorkspaceKey(identity, args.clerkOrgId);

    return await getWorkspaceByKey(ctx, workspaceKey);
  },
});

export const getById = query({
  args: {
    workspaceId: v.id("workspaces"),
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    return await requireWorkspaceAccess(ctx, args.workspaceId, args.clerkOrgId);
  },
});

export const syncActiveWorkspace = mutation({
  args: {
    clerkOrgId: v.union(v.string(), v.null()),
    name: v.string(),
    slug: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = requireIdentity(await ctx.auth.getUserIdentity());
    const workspaceKey = getCurrentWorkspaceKey(identity, args.clerkOrgId);
    const user = await upsertCurrentUser(ctx, {
      email: args.email,
      name: args.clerkOrgId ? null : args.name,
      imageUrl: args.clerkOrgId ? null : args.imageUrl,
      defaultWorkspaceKey: workspaceKey,
    });
    const existing = await getWorkspaceByKey(ctx, workspaceKey);
    const now = Date.now();
    const slug = normalizeWorkspaceSlug(args.slug ?? args.name);
    const patch = {
      kind: args.clerkOrgId ? "organization" : "personal",
      clerkOrgId: args.clerkOrgId,
      ownerClerkUserId: identity.subject,
      name: args.name,
      slug,
      imageUrl: args.imageUrl,
      updatedAt: now,
    } as const;

    if (existing) {
      await ctx.db.patch(existing._id, patch);

      return {
        ...existing,
        ...patch,
      };
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      workspaceKey,
      ...patch,
      createdBy: user._id,
      createdAt: now,
    });
    const workspace = await ctx.db.get(workspaceId);

    if (!workspace) {
      throw new Error("Failed to create workspace");
    }

    return workspace;
  },
});
