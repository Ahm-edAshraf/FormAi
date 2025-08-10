import { createClient as createSupabaseBrowser } from '@/utils/supabase/client'
import { FieldSpec } from '@/lib/validators/form'

export async function fetchMyForms() {
  const supabase = createSupabaseBrowser()
  const { data, error } = await supabase
    .from('forms')
    .select('id, title, description, status, slug, created_at, updated_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchFormWithFields(formId: string) {
  const supabase = createSupabaseBrowser()
  const [{ data: form, error: formError }, { data: fields, error: fieldsError }] = await Promise.all([
    supabase.from('forms').select('*').eq('id', formId).single(),
    supabase.from('form_fields').select('*').eq('form_id', formId).order('position', { ascending: true }),
  ])
  if (formError) throw formError
  if (fieldsError) throw fieldsError
  return { form, fields }
}

export async function saveFormMeta(
  formId: string,
  updates: { title?: string; description?: string | null; allow_multiple_responses?: boolean }
) {
  const supabase = createSupabaseBrowser()
  const { error } = await supabase
    .from('forms')
    .update({ ...updates })
    .eq('id', formId)
  if (error) throw error
}

export async function saveFields(formId: string, fields: FieldSpec[]) {
  // Route handler performs robust upsert (insert/update/delete)
  const res = await fetch(`/api/forms/${formId}/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fields.map((f, idx) => ({ ...f, position: f.position ?? idx })) }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to save fields')
  }
}


