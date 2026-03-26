import type { Id } from '@/convex/_generated/dataModel'

export type EditorField = {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: Record<string, unknown>
  position?: number
}

export function mapDashboardRows(rows: Array<{
  _id: Id<'forms'>
  title: string
  description: string
  status: 'draft' | 'published'
  slug?: string
  submissions: number
  views: number
  createdAt: number
}>) {
  return rows.map((row) => ({
    id: row._id,
    title: row.title,
    description: row.description,
    status: row.status,
    slug: row.slug,
    submissions: row.submissions,
    views: row.views,
    createdAt: new Date(row.createdAt).toISOString().slice(0, 10),
    isAIGenerated: true,
  }))
}

export function mapConvexFieldsToEditorFields(fields: Array<{
  _id: Id<'formFields'>
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: Record<string, unknown>
  position: number
}>) {
  return fields.map((field) => ({
    id: field._id,
    type: field.type,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    options: field.options,
    validation: field.validation,
    position: field.position,
  }))
}

export function toConvexFieldInput(fields: EditorField[]) {
  return fields.map((field, index) => ({
    id: field.id.startsWith('local:') ? undefined : (field.id as Id<'formFields'>),
    type: field.type,
    label: field.label,
    placeholder: field.placeholder ?? '',
    required: field.required ?? false,
    options: field.options ?? [],
    validation: field.validation ?? {},
    position: index,
  }))
}

export function areEditorFieldsEquivalent(left: EditorField[], right: EditorField[]) {
  const normalize = (fields: EditorField[]) =>
    fields.map((field, index) => ({
      id: field.id,
      type: field.type,
      label: field.label,
      placeholder: field.placeholder ?? '',
      required: field.required ?? false,
      options: field.options ?? [],
      validation: field.validation ?? {},
      position: field.position ?? index,
    }))

  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))
}

export function shouldApplyServerFields({ requestId, latestRequestId }: { requestId: number; latestRequestId: number }) {
  return requestId === latestRequestId
}

export function shouldHydrateEditorFields({
  currentFields,
  lastPersistedFields,
  serverFields,
}: {
  currentFields: EditorField[]
  lastPersistedFields: EditorField[]
  serverFields: EditorField[]
}) {
  return areEditorFieldsEquivalent(currentFields, lastPersistedFields) && !areEditorFieldsEquivalent(currentFields, serverFields)
}

export function shouldHydrateTextValue({
  currentValue,
  lastPersistedValue,
  serverValue,
}: {
  currentValue: string
  lastPersistedValue: string
  serverValue: string
}) {
  return currentValue === lastPersistedValue && currentValue !== serverValue
}

export function shouldHydrateBooleanValue({
  currentValue,
  lastPersistedValue,
  serverValue,
}: {
  currentValue: boolean
  lastPersistedValue: boolean
  serverValue: boolean
}) {
  return currentValue === lastPersistedValue && currentValue !== serverValue
}

export function seedClientSaveId(lastSavedId: number | undefined) {
  return (lastSavedId ?? 0) + 1
}
