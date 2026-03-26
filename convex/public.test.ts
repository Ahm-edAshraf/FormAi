/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const serverSecret = 'sk_test_placeholder'

describe('public form flows', () => {
  test('returns only published forms by slug', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Public Form',
      description: 'draft',
    })

    expect(await t.query(api.forms.getPublishedBySlug, { slug: 'public-form' })).toBeNull()

    await asAhmed.mutation(api.forms.publish, { formId, desiredSlug: 'public-form' })

    const published = await t.query(api.forms.getPublishedBySlug, { slug: 'public-form' })
    expect(published?.form.title).toBe('Public Form')
  })

  test('validates required, email, and number fields on public submit', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Validation Form',
      description: 'checks',
    })
    await asAhmed.mutation(api.forms.replaceFields, {
      formId,
      fields: [
        { type: 'email', label: 'Email', placeholder: '', required: true, options: [], validation: {}, position: 0 },
        { type: 'number', label: 'Age', placeholder: '', required: false, options: [], validation: {}, position: 1 },
      ],
      clientSaveId: 1,
    })
    await asAhmed.mutation(api.forms.publish, { formId, desiredSlug: 'validation-form' })
    const published = await t.query(api.forms.getPublishedBySlug, { slug: 'validation-form' })
    const emailFieldId = String(published!.fields[0]!._id)
    const ageFieldId = String(published!.fields[1]!._id)

    await expect(t.mutation(api.submissions.submitPublic, {
      formId,
      answers: {},
      visitorToken: 'visitor-1',
      serverSecret,
    })).rejects.toThrow('Missing required fields')

    await expect(t.mutation(api.submissions.submitPublic, {
      formId,
      answers: { [emailFieldId]: 'not-an-email' },
      visitorToken: 'visitor-1',
      serverSecret,
    })).rejects.toThrow('Invalid email')

    await expect(t.mutation(api.submissions.submitPublic, {
      formId,
      answers: { [emailFieldId]: 'jane@example.com', [ageFieldId]: 'abc' },
      visitorToken: 'visitor-1',
      serverSecret,
    })).rejects.toThrow('Invalid number')
  })

  test('enforces one response per visitor when multiple responses are disabled', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Single Response',
      description: 'one only',
    })
    await asAhmed.mutation(api.forms.saveMeta, {
      formId,
      title: 'Single Response',
      description: 'one only',
      allowMultipleResponses: false,
      clientSaveId: 1,
    })
    await asAhmed.mutation(api.forms.publish, { formId, desiredSlug: 'single-response' })

    await t.mutation(api.submissions.submitPublic, {
      formId,
      answers: {},
      visitorToken: 'visitor-1',
      serverSecret,
    })

    await expect(t.mutation(api.submissions.submitPublic, {
      formId,
      answers: {},
      visitorToken: 'visitor-1',
      serverSecret,
    })).rejects.toThrow('Already submitted')
  })

  test('enforces the free-plan monthly submission cap for the owner', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Capped Form',
      description: 'cap',
    })
    await asAhmed.mutation(api.forms.publish, { formId, desiredSlug: 'capped-form' })

    await t.run(async (ctx) => {
      for (let index = 0; index < 100; index += 1) {
        const submissionId = await ctx.db.insert('submissions', {
          formId,
          ownerUserId: 'clerk|ahmed',
          userId: `visitor-${index}`,
          visitorToken: `visitor-${index}`,
          data: {},
          createdAt: Date.now() + index,
        })
        await ctx.db.insert('submissionEvents', {
          userId: 'clerk|ahmed',
          formId,
          submissionId,
          createdAt: Date.now() + index,
        })
      }
    })

    await expect(t.mutation(api.submissions.submitPublic, {
      formId,
      answers: {},
      visitorToken: 'visitor-over-limit',
      serverSecret,
    })).rejects.toThrow('Monthly submission cap reached')
  })

  test('does not cap pro owners when billing profile says pro', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Pro Form',
      description: 'pro',
    })
    await asAhmed.mutation(api.forms.publish, { formId, desiredSlug: 'pro-form' })

    await t.run(async (ctx) => {
      await ctx.db.insert('billingProfiles', {
        userId: 'clerk|ahmed',
        plan: 'pro',
        updatedAt: Date.now(),
      })
      for (let index = 0; index < 100; index += 1) {
        const submissionId = await ctx.db.insert('submissions', {
          formId,
          ownerUserId: 'clerk|ahmed',
          userId: `visitor-${index}`,
          visitorToken: `visitor-${index}`,
          data: {},
          createdAt: Date.now() + index,
        })
        await ctx.db.insert('submissionEvents', {
          userId: 'clerk|ahmed',
          formId,
          submissionId,
          createdAt: Date.now() + index,
        })
      }
    })

    await expect(t.mutation(api.submissions.submitPublic, {
      formId,
      answers: {},
      visitorToken: 'visitor-pro',
      serverSecret,
    })).resolves.toBeTruthy()
  })

  test('scopes upload urls to published forms only', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const draftFormId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Draft Upload',
      description: 'draft',
    })

    await expect(t.mutation(api.files.generateUploadUrl, { formId: draftFormId, serverSecret })).rejects.toThrow('Form not published')

    await asAhmed.mutation(api.forms.publish, { formId: draftFormId, desiredSlug: 'draft-upload' })

    await expect(t.mutation(api.files.generateUploadUrl, { formId: draftFormId, serverSecret })).resolves.toEqual(expect.any(String))
  })

  test('resolves a stored file id to a download url', async () => {
    const t = convexTest(schema, modules)
    const storageId = await t.run(async (ctx) => {
      return await ctx.storage.store(new Blob(['demo']))
    })

    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })
    const asSara = t.withIdentity({ tokenIdentifier: 'clerk|sara', subject: 'sara' })
    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Files Form',
      description: 'files',
    })
    await asAhmed.mutation(api.forms.publish, { formId, desiredSlug: 'files-form' })
    await t.run(async (ctx) => {
      await ctx.db.insert('fileUploads', {
        storageId,
        formId,
        ownerUserId: 'clerk|ahmed',
        fieldId: 'field_file',
        fileName: 'demo.txt',
        contentType: 'text/plain',
        size: 4,
        createdAt: Date.now(),
      })
    })

    const url = await asAhmed.query(api.files.getFileUrlForOwner, { storageId })

    expect(url).toEqual(expect.any(String))
    await expect(asSara.query(api.files.getFileUrlForOwner, { storageId })).resolves.toBeNull()
  })

  test('tracks views with a persisted visitor token', async () => {
    const t = convexTest(schema, modules)
    const asAhmed = t.withIdentity({ tokenIdentifier: 'clerk|ahmed', subject: 'ahmed' })

    const formId = await asAhmed.mutation(api.forms.createDraft, {
      title: 'Viewed Form',
      description: 'views',
    })
    await asAhmed.mutation(api.forms.publish, { formId, desiredSlug: 'viewed-form' })

    await t.mutation(api.submissions.trackView, {
      formId,
      visitorToken: 'visitor-1',
      serverSecret,
    })

    const summary = await asAhmed.query(api.forms.dashboardSummary, {})
    expect(summary.totals.totalViews).toBe(1)
  })
})
