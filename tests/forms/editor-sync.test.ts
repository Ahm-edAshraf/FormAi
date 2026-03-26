import { describe, expect, it } from 'vitest'
import { areEditorFieldsEquivalent, shouldApplyServerFields, shouldHydrateBooleanValue, shouldHydrateEditorFields, shouldHydrateTextValue, seedClientSaveId } from '@/lib/forms'

describe('editor field sync', () => {
  it('treats logically identical field lists as equivalent', () => {
    const local = [
      { id: 'abc123', type: 'text', label: 'Name', placeholder: '', required: false, options: [], position: 0 },
    ]
    const server = [
      { id: 'abc123', type: 'text', label: 'Name', placeholder: '', required: false, options: [], position: 0 },
    ]

    expect(areEditorFieldsEquivalent(local, server)).toBe(true)
  })

  it('detects when the server field payload actually changed', () => {
    const local = [
      { id: 'abc123', type: 'text', label: 'Name', placeholder: '', required: false, options: [], position: 0 },
    ]
    const server = [
      { id: 'abc123', type: 'text', label: 'Full Name', placeholder: '', required: false, options: [], position: 0 },
    ]

    expect(areEditorFieldsEquivalent(local, server)).toBe(false)
  })

  it('ignores stale autosave responses from older requests', () => {
    expect(shouldApplyServerFields({ requestId: 1, latestRequestId: 2 })).toBe(false)
    expect(shouldApplyServerFields({ requestId: 2, latestRequestId: 2 })).toBe(true)
  })

  it('does not hydrate server fields over newer unsaved local edits', () => {
    const lastPersisted = [
      { id: 'abc123', type: 'text', label: 'Name', placeholder: '', required: false, options: [], position: 0 },
    ]
    const current = [
      { id: 'abc123', type: 'text', label: 'Changed Locally', placeholder: '', required: false, options: [], position: 0 },
    ]
    const server = [
      { id: 'abc123', type: 'text', label: 'Name', placeholder: '', required: false, options: [], position: 0 },
    ]

    expect(shouldHydrateEditorFields({ currentFields: current, lastPersistedFields: lastPersisted, serverFields: server })).toBe(false)
  })

  it('hydrates server fields when local state still matches the last persisted snapshot', () => {
    const lastPersisted = [
      { id: 'abc123', type: 'text', label: 'Name', placeholder: '', required: false, options: [], position: 0 },
    ]
    const current = [
      { id: 'abc123', type: 'text', label: 'Name', placeholder: '', required: false, options: [], position: 0 },
    ]
    const server = [
      { id: 'abc123', type: 'text', label: 'Name from Server', placeholder: '', required: false, options: [], position: 0 },
    ]

    expect(shouldHydrateEditorFields({ currentFields: current, lastPersistedFields: lastPersisted, serverFields: server })).toBe(true)
  })

  it('does not hydrate stale server metadata over newer local text edits', () => {
    expect(shouldHydrateTextValue({ currentValue: 'Changed locally', lastPersistedValue: 'Original', serverValue: 'Original' })).toBe(false)
  })

  it('hydrates server metadata when local text still matches the last persisted value', () => {
    expect(shouldHydrateTextValue({ currentValue: 'Original', lastPersistedValue: 'Original', serverValue: 'From server' })).toBe(true)
  })

  it('does not hydrate when local and server metadata already match', () => {
    expect(shouldHydrateTextValue({ currentValue: 'Same', lastPersistedValue: 'Same', serverValue: 'Same' })).toBe(false)
  })

  it('does not hydrate stale boolean settings over newer local toggles', () => {
    expect(shouldHydrateBooleanValue({ currentValue: true, lastPersistedValue: false, serverValue: false })).toBe(false)
  })

  it('hydrates boolean settings when local state still matches the last persisted value', () => {
    expect(shouldHydrateBooleanValue({ currentValue: false, lastPersistedValue: false, serverValue: true })).toBe(true)
  })

  it('seeds the next client save id from the server revision', () => {
    expect(seedClientSaveId(0)).toBe(1)
    expect(seedClientSaveId(4)).toBe(5)
  })
})
