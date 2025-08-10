import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { slugify } from '@/lib/utils/slug'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { slug: desired } = await request.json().catch(() => ({}))
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: form, error: formErr } = await supabase
      .from('forms')
      .select('id,title,user_id')
      .eq('id', params.id)
      .single()
    if (formErr) throw formErr
    if (form.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const base = slugify(desired || form.title)
    // ensure unique slug
    let slug = base
    let i = 1
    // limit loop iterations
    for (;;) {
      const { data: existing, error } = await supabase
        .from('forms')
        .select('id')
        .neq('id', form.id)
        .eq('slug', slug)
        .maybeSingle()
      if (error) throw error
      if (!existing) break
      slug = `${base}-${i++}`
      if (i > 50) break
    }

    const { error: updErr } = await supabase
      .from('forms')
      .update({ status: 'published', slug })
      .eq('id', form.id)
    if (updErr) throw updErr

    // Revalidate cached public page and data
    revalidateTag(`form:slug:${slug}`)
    // keep dashboard fresh for the owner
    revalidateTag(`dashboard:user:${user.id}`)
    return NextResponse.json({ slug })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}


