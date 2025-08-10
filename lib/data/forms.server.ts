import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { FormSpec, FormSpecSchema, FieldSpec } from '@/lib/validators/form'

export async function createFormDraft(userId: string, spec: FormSpec) {
  const cookieStore = cookies()
  const supabase = createSupabaseServer(cookieStore)
  const parsed = FormSpecSchema.parse(spec)

  const { data: form, error: formError } = await supabase
    .from('forms')
    .insert({
      user_id: userId,
      title: parsed.title,
      description: parsed.description ?? null,
      status: 'draft',
    })
    .select('*')
    .single()
  if (formError) throw formError

  const fields = (parsed.fields ?? []).map((f, idx) => ({
    form_id: form.id,
    type: f.type,
    label: f.label,
    placeholder: f.placeholder ?? null,
    required: f.required ?? false,
    options: f.options ?? null,
    validation: f.validation ?? null,
    position: f.position ?? idx,
  }))
  if (fields.length > 0) {
    const { error: fieldsError } = await supabase.from('form_fields').insert(fields)
    if (fieldsError) throw fieldsError
  }

  return form
}

export async function getFormWithFields(formId: string) {
  const cookieStore = cookies()
  const supabase = createSupabaseServer(cookieStore)
  const [{ data: form, error: formError }, { data: fields, error: fieldsError }] = await Promise.all([
    supabase.from('forms').select('*').eq('id', formId).single(),
    supabase.from('form_fields').select('*').eq('form_id', formId).order('position', { ascending: true }),
  ])
  if (formError) throw formError
  if (fieldsError) throw fieldsError
  return { form, fields }
}

export async function updateFormMeta(formId: string, updates: { title?: string; description?: string | null }) {
  const cookieStore = cookies()
  const supabase = createSupabaseServer(cookieStore)
  const { error } = await supabase
    .from('forms')
    .update({ ...updates })
    .eq('id', formId)
  if (error) throw error
}

export async function upsertFields(formId: string, fields: FieldSpec[]) {
  const cookieStore = cookies()
  const supabase = createSupabaseServer(cookieStore)
  // Strategy: delete missing, update existing, insert new
  const { data: existing, error: existingErr } = await supabase
    .from('form_fields')
    .select('id')
    .eq('form_id', formId)
  if (existingErr) throw existingErr
  const existingIds = new Set((existing ?? []).map((x: any) => x.id))

  const toInsert = fields.filter((f) => !f.id).map((f, idx) => ({
    form_id: formId,
    type: f.type,
    label: f.label,
    placeholder: f.placeholder ?? null,
    required: f.required ?? false,
    options: f.options ?? null,
    validation: f.validation ?? null,
    position: f.position ?? idx,
  }))
  const toUpdate = fields.filter((f) => f.id && existingIds.has(f.id)) as (FieldSpec & { id: string })[]
  const updatePromises = toUpdate.map((f, idx) =>
    supabase
      .from('form_fields')
      .update({
        type: f.type,
        label: f.label,
        placeholder: f.placeholder ?? null,
        required: f.required ?? false,
        options: f.options ?? null,
        validation: f.validation ?? null,
        position: f.position ?? idx,
      })
      .eq('id', f.id)
  )

  const deleteIds = (existing ?? [])
    .map((x: any) => x.id)
    .filter((id: string) => !fields.some((f) => f.id === id))
  const deletePromise = deleteIds.length > 0 ? supabase.from('form_fields').delete().in('id', deleteIds) : null

  const { error: insertErr } = toInsert.length > 0 ? await supabase.from('form_fields').insert(toInsert) : { error: null }
  if (insertErr) throw insertErr
  await Promise.all(updatePromises)
  if (deletePromise) {
    const { error: delErr } = await deletePromise
    if (delErr) throw delErr
  }
}

export async function publishForm(formId: string, slug: string) {
  const cookieStore = cookies()
  const supabase = createSupabaseServer(cookieStore)
  const { error } = await supabase
    .from('forms')
    .update({ status: 'published', slug })
    .eq('id', formId)
  if (error) throw error
}


