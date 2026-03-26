import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireServerSecret(serverSecret: string) {
  const expected = process.env.FORMAI_INTERNAL_SERVER_SECRET ?? process.env.CLERK_SECRET_KEY ?? 'formai-dev-server-secret'
  if (!expected || serverSecret !== expected) {
    throw new Error('Unauthorized')
  }
}

export const generateUploadUrl = mutation({
  args: {
    formId: v.id('forms'),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret)
    const form = await ctx.db.get(args.formId)
    if (!form || form.status !== 'published') {
      throw new Error('Form not published')
    }

    return await ctx.storage.generateUploadUrl()
  },
})

export const getFileUrlForOwner = query({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    const upload = await ctx.db
      .query('fileUploads')
      .withIndex('by_storage_id', (q) => q.eq('storageId', args.storageId))
      .unique()

    if (!upload || upload.ownerUserId !== identity.tokenIdentifier) {
      return null
    }

    return await ctx.storage.getUrl(args.storageId)
  },
})

export const deleteFiles = mutation({
  args: {
    storageIds: v.array(v.id('_storage')),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret)
    for (const storageId of args.storageIds) {
      await ctx.storage.delete(storageId)
    }
    return args.storageIds.length
  },
})
