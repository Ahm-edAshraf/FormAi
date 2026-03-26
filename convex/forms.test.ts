/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('forms domain', () => {
  test('lists forms only for the authenticated owner', async () => {
    const t = convexTest(schema, modules)

    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })
    const asSara = t.withIdentity({ tokenIdentifier: 'clerk|sara', subject: 'sara' })

    await asAhmed.mutation(api.forms.createDraft, {
      title: 'Ahmed Form',
      description: 'owner scoped',
    })
    await asSara.mutation(api.forms.createDraft, {
      title: 'Sara Form',
      description: 'owner scoped',
    })

    const ahmedForms = await asAhmed.query(api.forms.listMine, {})
    const saraForms = await asSara.query(api.forms.listMine, {})

    expect(ahmedForms).toHaveLength(1)
    expect(ahmedForms[0]?.title).toBe('Ahmed Form')
    expect(saraForms).toHaveLength(1)
    expect(saraForms[0]?.title).toBe('Sara Form')
  })

  test('publishes with a unique slug when the preferred slug already exists', async () => {
    const t = convexTest(schema, modules)

    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })
    const asSara = t.withIdentity({ tokenIdentifier: 'clerk|sara', subject: 'sara' })

    const first = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Contact Us',
      description: 'first',
    })
    const second = await asSara.mutation(api.forms.createDraft, {
      title: 'Contact Us',
      description: 'second',
    })

    const firstSlug = await asAhmed.mutation(api.forms.publish, {
      formId: first,
      desiredSlug: 'contact-us',
    })
    const secondSlug = await asSara.mutation(api.forms.publish, {
      formId: second,
      desiredSlug: 'contact-us',
    })

    expect(firstSlug).toBe('contact-us')
    expect(secondSlug).toBe('contact-us-1')
  })

  test('loads a form with its fields only for the owner', async () => {
    const t = convexTest(schema, modules)

    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })
    const asSara = t.withIdentity({ tokenIdentifier: 'clerk|sara', subject: 'sara' })

    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Feedback',
      description: 'Tell us more',
    })

    await asAhmed.mutation(api.forms.replaceFields, {
      formId,
      fields: [
        { type: 'text', label: 'Name', placeholder: 'Jane', required: true, options: [], position: 0 },
        { type: 'email', label: 'Email', placeholder: 'jane@example.com', required: true, options: [], position: 1 },
      ],
      clientSaveId: 1,
    })

    const owned = await asAhmed.query(api.forms.getMine, { formId })
    const чужое = await asSara.query(api.forms.getMine, { formId })

    expect(owned?.form.title).toBe('Feedback')
    expect(owned?.fields).toHaveLength(2)
    expect(owned?.fields[0]?.label).toBe('Name')
    expect(чужое).toBeNull()
  })

  test('updates form metadata and replaces fields in the new order', async () => {
    const t = convexTest(schema, modules)

    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })
    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Initial Title',
      description: 'Initial description',
    })

    await asAhmed.mutation(api.forms.replaceFields, {
      formId,
      fields: [
        { type: 'text', label: 'First', placeholder: '', required: false, options: [], position: 0, validation: {} },
        { type: 'text', label: 'Second', placeholder: '', required: false, options: [], position: 1, validation: {} },
      ],
      clientSaveId: 1,
    })

    const initial = await asAhmed.query(api.forms.getMine, { formId })
    const secondFieldId = initial!.fields[1]!._id

    await asAhmed.mutation(api.forms.saveMeta, {
      formId,
      title: 'Updated Title',
      description: 'Updated description',
      allowMultipleResponses: true,
      clientSaveId: 1,
    })

    await asAhmed.mutation(api.forms.replaceFields, {
      formId,
      fields: [
        { id: secondFieldId, type: 'text', label: 'Second Updated', placeholder: '', required: false, options: [], position: 0, validation: { minLength: 2 } },
        { type: 'textarea', label: 'Third', placeholder: 'Tell us more', required: true, options: [], position: 1, validation: { maxLength: 500 } },
      ],
      clientSaveId: 2,
    })

    const updated = await asAhmed.query(api.forms.getMine, { formId })

    expect(updated?.form.title).toBe('Updated Title')
    expect(updated?.form.description).toBe('Updated description')
    expect(updated?.form.allowMultipleResponses).toBe(true)
    expect(updated?.fields).toHaveLength(2)
    expect(updated?.fields[0]?.label).toBe('Second Updated')
    expect(updated?.fields[0]?.validation).toEqual({ minLength: 2 })
    expect(updated?.fields[1]?.type).toBe('textarea')
    expect(updated?.fields[1]?.validation).toEqual({ maxLength: 500 })
  })

  test('rejects field replacement when a supplied field id belongs to another form', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const firstFormId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'First Form',
      description: 'first',
    })
    const secondFormId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Second Form',
      description: 'second',
    })

    await asAhmed.mutation(api.forms.replaceFields, {
      formId: firstFormId,
      fields: [
        { type: 'text', label: 'First Field', placeholder: '', required: false, options: [], position: 0, validation: {} },
      ],
      clientSaveId: 1,
    })

    const firstLoaded = await asAhmed.query(api.forms.getMine, { formId: firstFormId })
    const foreignFieldId = firstLoaded!.fields[0]!._id

    await expect(
      asAhmed.mutation(api.forms.replaceFields, {
        formId: secondFormId,
        fields: [
          { id: foreignFieldId, type: 'text', label: 'Tampered', placeholder: '', required: false, options: [], position: 0, validation: {} },
        ],
        clientSaveId: 1,
      })
    ).rejects.toThrow('Field does not belong to form')
  })

  test('creates a draft from a generated form spec with initial fields', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const formId = await asAhmed.mutation(api.forms.createFromSpec, {
      spec: {
        title: 'Lead Capture',
        description: 'Generated by AI',
        fields: [
          { type: 'text', label: 'Name', placeholder: 'Jane', required: true, options: [], validation: {} },
          { type: 'email', label: 'Email', placeholder: 'jane@example.com', required: true, options: [], validation: {} },
        ],
      },
    })

    const created = await asAhmed.query(api.forms.getMine, { formId })

    expect(created?.form.title).toBe('Lead Capture')
    expect(created?.fields).toHaveLength(2)
    expect(created?.fields[0]?.position).toBe(0)
    expect(created?.fields[1]?.label).toBe('Email')
  })

  test('returns dashboard totals and deletes only owned forms', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })
    const asSara = t.withIdentity({ tokenIdentifier: 'clerk|sara', subject: 'sara' })

    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Dashboard Form',
      description: 'stats',
    })

    await t.run(async (ctx) => {
      await ctx.db.insert('submissions', {
        formId,
        userId: 'visitor-1',
        visitorToken: 'visitor-1',
        data: { message: 'hello' },
        createdAt: Date.now(),
      })
      await ctx.db.insert('formViews', {
        formId,
        userId: 'visitor-1',
        visitorToken: 'visitor-1',
        createdAt: Date.now(),
      })
      await ctx.db.insert('formViews', {
        formId,
        userId: 'visitor-2',
        visitorToken: 'visitor-2',
        createdAt: Date.now(),
      })
    })

    const summary = await asAhmed.query(api.forms.dashboardSummary, {})

    expect(summary.totals.totalForms).toBe(1)
    expect(summary.totals.totalSubmissions).toBe(1)
    expect(summary.totals.totalViews).toBe(2)

    await expect(asSara.mutation(api.forms.deleteMine, { formId })).rejects.toThrow('Forbidden')
    await asAhmed.mutation(api.forms.deleteMine, { formId })

    const afterDelete = await asAhmed.query(api.forms.dashboardSummary, {})
    expect(afterDelete.rows).toHaveLength(0)
  })

  test('counts forms and events beyond the old dashboard hard limits', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    let firstFormId: Id<'forms'> | null = null
    for (let index = 0; index < 101; index += 1) {
      const created = await asAhmed.mutation(api.forms.createDraft, {
        title: `Form ${index + 1}`,
        description: 'bulk',
      })
      if (index === 0) {
        firstFormId = created
      }
    }

    await t.run(async (ctx) => {
      for (let index = 0; index < 1001; index += 1) {
        await ctx.db.insert('formViews', {
          formId: firstFormId!,
          userId: `viewer-${index}`,
          visitorToken: `viewer-${index}`,
          createdAt: Date.now() + index,
        })
      }
    })

    const summary = await asAhmed.query(api.forms.dashboardSummary, {})

    expect(summary.totals.totalForms).toBe(101)
    expect(summary.totals.totalViews).toBe(1001)
  })
})
