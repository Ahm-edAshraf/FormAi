import { v } from 'convex/values'
import { mutation } from './_generated/server'

function requireServerSecret(serverSecret: string) {
  const expected = process.env.FORMAI_INTERNAL_SERVER_SECRET ?? process.env.CLERK_SECRET_KEY ?? 'formai-dev-server-secret'
  if (!expected || serverSecret !== expected) {
    throw new Error('Unauthorized')
  }
}

function isMissing(value: unknown) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)
}

export const submitPublic = mutation({
  args: {
    formId: v.id('forms'),
    answers: v.record(v.string(), v.any()),
    visitorToken: v.string(),
    submitterUserId: v.optional(v.string()),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret)
    const form = await ctx.db.get(args.formId)
    if (!form || form.status !== 'published') {
      throw new Error('Form not found')
    }

    const fields = await ctx.db
      .query('formFields')
      .withIndex('by_form_id_and_position', (q) => q.eq('formId', args.formId))
      .order('asc')
      .take(200)

    const missing: string[] = []
    for (const field of fields) {
      const value = args.answers[String(field._id)]
      if (field.required && isMissing(value)) {
        missing.push(field.label)
      }
      if (!isMissing(value)) {
        if (field.type === 'email') {
          const valid = /.+@.+\..+/.test(String(Array.isArray(value) ? value[0] : value))
          if (!valid) throw new Error('Invalid email')
        }
        if (field.type === 'number' && Number.isNaN(Number(Array.isArray(value) ? value[0] : value))) {
          throw new Error('Invalid number')
        }
      }
    }
    if (missing.length) {
      throw new Error('Missing required fields')
    }

    const owner = await ctx.db
      .query('billingProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', form.userId))
      .unique()
    const plan = owner?.plan ?? 'free'

    if (plan === 'free') {
      const monthStart = new Date()
      monthStart.setUTCDate(1)
      monthStart.setUTCHours(0, 0, 0, 0)
      let monthlySubmissions = 0
      for await (const _event of ctx.db.query('submissionEvents').withIndex('by_user_id_and_created_at', (q) => q.eq('userId', form.userId).gte('createdAt', monthStart.getTime()))) {
        monthlySubmissions += 1
      }
      if (monthlySubmissions >= 100) {
        throw new Error('Monthly submission cap reached')
      }
    }

    if (!form.allowMultipleResponses) {
      for await (const submission of ctx.db.query('submissions').withIndex('by_form_id_and_created_at', (q) => q.eq('formId', args.formId))) {
        if (submission.visitorToken === args.visitorToken || (args.submitterUserId && submission.userId === args.submitterUserId)) {
          throw new Error('Already submitted')
        }
      }
    }

    const submissionId = await ctx.db.insert('submissions', {
      formId: args.formId,
      ownerUserId: form.userId,
      userId: args.submitterUserId,
      visitorToken: args.visitorToken,
      data: args.answers,
      createdAt: Date.now(),
    })

    for (const [fieldId, value] of Object.entries(args.answers)) {
      const values = Array.isArray(value) ? value : [value]
      for (const item of values) {
        if (item && typeof item === 'object' && 'storageId' in item && typeof item.storageId === 'string') {
          await ctx.db.insert('fileUploads', {
            storageId: item.storageId,
            formId: args.formId,
            ownerUserId: form.userId,
            fieldId,
            fileName: typeof item.name === 'string' ? item.name : 'upload',
            contentType: typeof item.type === 'string' ? item.type : undefined,
            size: typeof item.size === 'number' ? item.size : 0,
            createdAt: Date.now(),
          })
        }
      }
    }

    await ctx.db.insert('submissionEvents', {
      userId: form.userId,
      formId: args.formId,
      submissionId,
      createdAt: Date.now(),
    })

    return submissionId
  },
})

export const trackView = mutation({
  args: {
    formId: v.id('forms'),
    visitorToken: v.string(),
    submitterUserId: v.optional(v.string()),
    serverSecret: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.serverSecret)
    const form = await ctx.db.get(args.formId)
    if (!form || form.status !== 'published') {
      return null
    }

    return await ctx.db.insert('formViews', {
      formId: args.formId,
      ownerUserId: form.userId,
      userId: args.submitterUserId,
      visitorToken: args.visitorToken,
      createdAt: Date.now(),
    })
  },
})
