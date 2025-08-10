import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {

    // Track slug for redirecting back to public page on any error (handled via _currentSlug from DB)
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    const formId = params.id

    const { data: form, error: formErr } = await supabase
      .from('forms')
      .select('id, status, allow_multiple_responses, slug, user_id')
      .eq('id', formId)
      .single()
    if (formErr) throw formErr
    const _currentSlug = form.slug
    if (form.status !== 'published') {
      // Redirect back so UI can surface a toast
      return NextResponse.redirect(new URL(`/f/${_currentSlug ?? ''}?error=failed`, request.url), { status: 303 })
    }

    const body = await request.formData()
    const entries: Record<string, any> = {}
    const fileUploads: Array<{ fieldId: string; file: File }> = []
    for (const [key, value] of body.entries()) {
      if (value instanceof File) {
        if (value.size > 0) fileUploads.push({ fieldId: key, file: value })
        continue
      }
      if (entries[key]) {
        entries[key] = Array.isArray(entries[key]) ? [...entries[key], value] : [entries[key], value]
      } else {
        entries[key] = value
      }
    }

    // Upload files to storage and store URLs
    if (fileUploads.length > 0) {
      for (const { fieldId, file } of fileUploads) {
        const filename = `${formId}/${crypto.randomUUID()}-${file.name}`
        const { error: uploadErr } = await supabase.storage.from('form-uploads').upload(filename, file)
        if (uploadErr) throw uploadErr
        const { data: urlData } = await supabase.storage.from('form-uploads').getPublicUrl(filename)
        // Store structured file info to support signed URLs later
        entries[fieldId] = {
          url: urlData.publicUrl,
          path: filename,
          name: file.name,
          type: file.type,
          size: file.size,
        }
      }
    }

    // Server-side validation: ensure required fields present and basic type checks
    const { data: fields } = await supabase
      .from('form_fields')
      .select('id,type,label,required,validation')
      .eq('form_id', formId)
    const missing: string[] = []
    for (const f of fields ?? []) {
      const key = (f as any).id
      if ((f as any).required) {
        const v = (entries as any)[key]
        const isEmpty = v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)
        if (isEmpty) missing.push((f as any).label || key)
      }
      // Simple numeric/email checks
      const v = (entries as any)[key]
      if (v != null) {
        if ((f as any).type === 'number' && isNaN(Number(Array.isArray(v) ? v[0] : v))) {
          return NextResponse.redirect(new URL(`/f/${_currentSlug ?? ''}?error=failed`, request.url), { status: 303 })
        }
        if ((f as any).type === 'email') {
          const val = String(Array.isArray(v) ? v[0] : v)
          const ok = /.+@.+\..+/.test(val)
          if (!ok) return NextResponse.redirect(new URL(`/f/${_currentSlug ?? ''}?error=failed`, request.url), { status: 303 })
        }
      }
    }
    if (missing.length) {
      return NextResponse.redirect(new URL(`/f/${_currentSlug ?? ''}?error=failed`, request.url), { status: 303 })
    }

    // Enforce monthly submissions cap for Free plan (100 per calendar month across all forms owned by the same user)
    try {
      if ((form as any)?.user_id) {
        const ownerId = (form as any).user_id as string
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('user_id', ownerId)
          .single()
        const plan = (ownerProfile as any)?.plan ?? 'free'
        if (plan === 'free') {
          const monthStart = new Date()
          monthStart.setUTCDate(1)
          monthStart.setUTCHours(0, 0, 0, 0)
          const { data: ownerForms } = await supabase
            .from('forms')
            .select('id')
            .eq('user_id', ownerId)
          const ownerFormIds = (ownerForms ?? []).map((f: any) => f.id)
          if (ownerFormIds.length > 0) {
            const { count: subCount } = await supabase
              .from('submissions')
              .select('id', { count: 'exact', head: true })
              .in('form_id', ownerFormIds)
              .gte('created_at', monthStart.toISOString())
            if ((subCount ?? 0) >= 100) {
              return NextResponse.redirect(new URL(`/f/${_currentSlug ?? ''}?error=failed`, request.url), { status: 303 })
            }
          }
        }
      }
    } catch {
      // Non-fatal: if the cap check fails, continue to avoid blocking real submissions unexpectedly
    }

    // Identify anonymous visitors via a cookie token
    const cookieName = `v_${formId}`
    let visitor = cookieStore.get(cookieName)?.value
    if (!visitor) {
      visitor = crypto.randomUUID()
    }
    // One response per visitor enforcement when multiple not allowed
    if (!form.allow_multiple_responses) {
      const { count } = await supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId)
        .or(`user_id.eq.${user?.id ?? ''},visitor_token.eq.${visitor}`)
      if ((count ?? 0) > 0) return NextResponse.redirect(new URL(`/f/${form.slug}?error=already_submitted`, request.url), { status: 303 })
    }

    const { error: insErr } = await supabase
      .from('submissions')
      .insert({ form_id: formId, data: entries, user_id: user?.id ?? null, visitor_token: visitor })
    if (insErr) throw insErr

    const res = NextResponse.redirect(new URL(`/f/${form.slug}?submitted=1`, request.url), { status: 303 })
    // Persist visitor token for future submissions
    res.cookies.set(cookieName, visitor, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (err: any) {
    // Ensure variable is defined in this scope
    const currentSlug: string | null = null
    try {
      // Best-effort: redirect back to the form with a generic failure so UI can toast
      const url = new URL(request.url)
      const id = url.pathname.split('/').filter(Boolean).pop()
      let slug: string | null = null
      if (!currentSlug && id) {
        const supabase = createSupabaseServer(cookies())
        const { data } = await supabase.from('forms').select('slug').eq('id', id).single()
        slug = (data as any)?.slug ?? null
      }
      const finalSlug = currentSlug ?? slug ?? ''
      return NextResponse.redirect(new URL(`/f/${finalSlug}?error=failed`, request.url), { status: 303 })
    } catch {
      return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
    }
  }
}


