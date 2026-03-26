import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  getCurrentUserRecord,
  getCurrentWorkspaceKey,
  getWorkspaceByKey,
  normalizeWorkspaceSlug,
  requireIdentity,
  upsertCurrentUser,
} from "./lib/auth";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    requireIdentity(await ctx.auth.getUserIdentity());
    return await getCurrentUserRecord(ctx);
  },
});

export const syncCurrentUser = mutation({
  args: {
    email: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    clerkOrgId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = requireIdentity(await ctx.auth.getUserIdentity());
    const workspaceKey = getCurrentWorkspaceKey(identity, args.clerkOrgId);
    const now = Date.now();
    const userName = args.name?.trim() || args.email || "Personal workspace";

    const user = await upsertCurrentUser(ctx, {
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      defaultWorkspaceKey: workspaceKey,
    });

    const existingWorkspace = await getWorkspaceByKey(ctx, workspaceKey);

    if (!existingWorkspace) {
      await ctx.db.insert("workspaces", {
        workspaceKey,
        kind: args.clerkOrgId ? "organization" : "personal",
        clerkOrgId: args.clerkOrgId,
        ownerClerkUserId: identity.subject,
        name: args.clerkOrgId ? "Organization workspace" : userName,
        slug: normalizeWorkspaceSlug(args.clerkOrgId ?? args.email ?? identity.subject),
        imageUrl: args.clerkOrgId ? null : args.imageUrl,
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
      });
    }

    return user;
  },
});
