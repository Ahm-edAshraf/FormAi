import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { QueryCtx, MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'

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

async function ensureUserRecord(ctx: MutationCtx, tokenIdentifier: string) {
  const existing = await ctx.db
    .query('users')
    .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', tokenIdentifier))
    .unique()

  if (existing) {
    return existing
  }

  const now = Date.now()
  const id = await ctx.db.insert('users', {
    clerkUserId: tokenIdentifier,
    plan: 'free',
    createdAt: now,
    updatedAt: now,
  })

  return await ctx.db.get(id)
}

export const createDraft = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentityToken(ctx)
    const now = Date.now()
    await ensureUserRecord(ctx, userId)

    return await ctx.db.insert('forms', {
      userId,
      title: args.title,
      description: args.description,
      status: 'draft',
      allowMultipleResponses: false,
      lastMetaSaveId: 0,
      lastFieldSaveId: 0,
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

export const getMine = query({
  args: {
    formId: v.id('forms'),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentityToken(ctx)
    const form = await ctx.db.get(args.formId)

    if (!form || form.userId !== userId) {
      return null
    }

    const fields = await ctx.db
      .query('formFields')
      .withIndex('by_form_id_and_position', (q) => q.eq('formId', args.formId))
      .order('asc')
      .take(200)

    return { form, fields }
  },
})

export const saveMeta = mutation({
  args: {
    formId: v.id('forms'),
    title: v.string(),
    description: v.string(),
    allowMultipleResponses: v.boolean(),
    clientSaveId: v.number(),
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
    if ((form.lastMetaSaveId ?? 0) >= args.clientSaveId) {
      return form
    }

    await ctx.db.patch(args.formId, {
      title: args.title,
      description: args.description,
      allowMultipleResponses: args.allowMultipleResponses,
      lastMetaSaveId: args.clientSaveId,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(args.formId)
  },
})

export const createFromSpec = mutation({
  args: {
    spec: v.object({
      title: v.string(),
      description: v.string(),
      fields: v.array(v.object({
        type: v.string(),
        label: v.string(),
        placeholder: v.string(),
        required: v.boolean(),
        options: v.array(v.string()),
        validation: v.optional(v.any()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireIdentityToken(ctx)
    const now = Date.now()
    await ensureUserRecord(ctx, userId)

    const formId = await ctx.db.insert('forms', {
      userId,
      title: args.spec.title,
      description: args.spec.description,
      status: 'draft',
      allowMultipleResponses: false,
      lastMetaSaveId: 0,
      lastFieldSaveId: 0,
      createdAt: now,
      updatedAt: now,
    })

    for (const [index, field] of args.spec.fields.entries()) {
      await ctx.db.insert('formFields', {
        formId,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options,
        validation: field.validation,
        position: index,
        createdAt: now,
        updatedAt: now,
      })
    }

    return formId
  },
})

export const replaceFields = mutation({
  args: {
    formId: v.id('forms'),
    fields: v.array(v.object({
      id: v.optional(v.id('formFields')),
      type: v.string(),
      label: v.string(),
      placeholder: v.string(),
      required: v.boolean(),
      options: v.array(v.string()),
      validation: v.optional(v.any()),
      position: v.number(),
    })),
    clientSaveId: v.number(),
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
    if ((form.lastFieldSaveId ?? 0) >= args.clientSaveId) {
      return await ctx.db
        .query('formFields')
        .withIndex('by_form_id_and_position', (q) => q.eq('formId', args.formId))
        .order('asc')
        .take(200)
    }

    const existing = await ctx.db
      .query('formFields')
      .withIndex('by_form_id_and_position', (q) => q.eq('formId', args.formId))
      .take(200)
    const existingIds = new Set(existing.map((field) => field._id))
    const retainedIds = new Set(args.fields.flatMap((field) => (field.id ? [field.id] : [])))

    for (const field of args.fields) {
      if (field.id && !existingIds.has(field.id)) {
        throw new Error('Field does not belong to form')
      }
    }

    for (const field of existing) {
      if (!retainedIds.has(field._id)) {
        await ctx.db.delete(field._id)
      }
    }

    for (const field of args.fields) {
      const value = {
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options,
        validation: field.validation,
        position: field.position,
        updatedAt: Date.now(),
      }

      if (field.id) {
        await ctx.db.patch(field.id, value)
      } else {
        await ctx.db.insert('formFields', {
          formId: args.formId,
          ...value,
          createdAt: Date.now(),
        })
      }
    }

    await ctx.db.patch(args.formId, {
      lastFieldSaveId: args.clientSaveId,
      updatedAt: Date.now(),
    })

    return await ctx.db
      .query('formFields')
      .withIndex('by_form_id_and_position', (q) => q.eq('formId', args.formId))
      .order('asc')
      .take(200)
  },
})

export const dashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireIdentityToken(ctx)

    const rows = [] as Array<{
      _id: Id<'forms'>
      title: string
      description: string
      status: 'draft' | 'published'
      slug?: string
      submissions: number
      views: number
      createdAt: number
    }>

    for await (const form of ctx.db.query('forms').withIndex('by_user_id', (q) => q.eq('userId', userId)).order('desc')) {
      let submissions = 0
      for await (const _submission of ctx.db.query('submissions').withIndex('by_form_id_and_created_at', (q) => q.eq('formId', form._id))) {
        submissions += 1
      }
      let views = 0
      for await (const _view of ctx.db.query('formViews').withIndex('by_form_id', (q) => q.eq('formId', form._id))) {
        views += 1
      }

      rows.push({
        _id: form._id,
        title: form.title,
        description: form.description ?? '',
        status: form.status,
        slug: form.slug,
        submissions,
        views,
        createdAt: form.createdAt,
      })
    }

    const totalSubmissions = rows.reduce((sum, row) => sum + row.submissions, 0)
    const totalViews = rows.reduce((sum, row) => sum + row.views, 0)

    return {
      rows,
      totals: {
        totalForms: rows.length,
        totalSubmissions,
        totalViews,
        conversionRate: totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0,
      },
    }
  },
})

export const deleteMine = mutation({
  args: {
    formId: v.id('forms'),
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

    const fields = await ctx.db
      .query('formFields')
      .withIndex('by_form_id_and_position', (q) => q.eq('formId', args.formId))
      .take(200)

    for (const field of fields) {
      await ctx.db.delete(field._id)
    }
    await ctx.db.delete(args.formId)

    return args.formId
  },
})

export const getPublishedBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query('forms')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()

    if (!form || form.status !== 'published') {
      return null
    }

    const fields = await ctx.db
      .query('formFields')
      .withIndex('by_form_id_and_position', (q) => q.eq('formId', form._id))
      .order('asc')
      .take(200)

    return { form, fields }
  },
})

export const getPublishedById = query({
  args: {
    formId: v.id('forms'),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId)
    if (!form || form.status !== 'published') {
      return null
    }
    return form
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
