import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  getCurrentUserRecord,
  getCurrentWorkspaceKey,
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

    return await upsertCurrentUser(ctx, {
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      defaultWorkspaceKey: getCurrentWorkspaceKey(identity, args.clerkOrgId),
    });
  },
});
