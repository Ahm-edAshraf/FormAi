import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

// Robust upsert for form fields that handles temporary client IDs
// POST body: { fields: Array<...> }
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formId = params.id
    // Owner check
    const { data: form, error: formErr } = await supabase
      .from('forms')
      .select('id,user_id')
      .eq('id', formId)
      .single()
    if (formErr) throw formErr
    if (form.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json().catch(() => null)
    const fields = Array.isArray(body?.fields) ? body.fields : []

    // Fetch existing field IDs for this form
    const { data: existing, error: existingErr } = await supabase
      .from('form_fields')
      .select('id')
      .eq('form_id', formId)
    if (existingErr) throw existingErr
    const existingIds = new Set((existing ?? []).map((x: any) => x.id))

    // Split payload into insert vs update
    // Treat any field with missing id OR id not in existing as insert
    const toInsert = fields
      .filter((f: any) => !f.id || !existingIds.has(f.id))
      .map((f: any, idx: number) => ({
        form_id: formId,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder ?? null,
        required: f.required ?? false,
        options: f.options ?? null,
        validation: f.validation ?? null,
        position: typeof f.position === 'number' ? f.position : idx,
      }))

    const toUpdate = fields
      .filter((f: any) => f.id && existingIds.has(f.id))
      .map((f: any, idx: number) => ({
        id: f.id,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder ?? null,
        required: f.required ?? false,
        options: f.options ?? null,
        validation: f.validation ?? null,
        position: typeof f.position === 'number' ? f.position : idx,
      }))

    const deleteIds = (existing ?? [])
      .map((x: any) => x.id)
      .filter((id: string) => !fields.some((f: any) => f.id === id))

    if (toInsert.length > 0) {
      const { error } = await supabase.from('form_fields').insert(toInsert)
      if (error) throw error
    }
    if (toUpdate.length > 0) {
      const updates = toUpdate.map((f: any) =>
        supabase
          .from('form_fields')
          .update({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            required: f.required,
            options: f.options,
            validation: f.validation,
            position: f.position,
          })
          .eq('id', f.id)
      )
      await Promise.all(updates)
    }
    if (deleteIds.length > 0) {
      const { error } = await supabase.from('form_fields').delete().in('id', deleteIds)
      if (error) throw error
    }

    // Revalidate tags: fields and dashboard and public page by slug
    revalidateTag(`fields:form:${formId}`)
    const { data: formRow } = await supabase.from('forms').select('user_id,slug').eq('id', formId).single()
    if (formRow?.user_id) revalidateTag(`dashboard:user:${formRow.user_id}`)
    if (formRow?.slug) {
      revalidateTag(`form:slug:${formRow.slug}`)
      revalidateTag(`fields:form:${formRow.slug}`)
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}


