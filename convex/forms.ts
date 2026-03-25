import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { QueryCtx, MutationCtx } from './_generated/server'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'form'
}

async function requireIdentityToken(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthenticated')
  }

  return identity.tokenIdentifier
}

export const createDraft = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentityToken(ctx)
    const now = Date.now()

    return await ctx.db.insert('forms', {
      userId,
      title: args.title,
      description: args.description,
      status: 'draft',
      allowMultipleResponses: false,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireIdentityToken(ctx)

    return await ctx.db
      .query('forms')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .order('desc')
      .take(100)
  },
})

export const publish = mutation({
  args: {
    formId: v.id('forms'),
    desiredSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentityToken(ctx)
    const form = await ctx.db.get(args.formId)

    if (!form) {
      throw new Error('Form not found')
    }
    if (form.userId !== userId) {
      throw new Error('Forbidden')
    }

    const base = slugify(args.desiredSlug || form.title)
    let candidate = base
    let suffix = 1

    while (true) {
      const existing = await ctx.db
        .query('forms')
        .withIndex('by_slug', (q) => q.eq('slug', candidate))
        .unique()

      if (!existing || existing._id === args.formId) {
        break
      }

      candidate = `${base}-${suffix}`
      suffix += 1
    }

    await ctx.db.patch(args.formId, {
      slug: candidate,
      status: 'published',
      updatedAt: Date.now(),
    })

    return candidate
  },
})
