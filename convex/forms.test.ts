/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
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
})
