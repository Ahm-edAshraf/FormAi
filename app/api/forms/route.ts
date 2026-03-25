import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { FormSpecSchema } from '@/lib/validators/form'
import { createFormDraft } from '@/lib/data/forms.server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body?.spec) return NextResponse.json({ error: 'Missing spec' }, { status: 400 })
    const parsed = FormSpecSchema.safeParse(body.spec)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid spec', issues: parsed.error.flatten() }, { status: 422 })

    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)

    // Check monthly forms limit for free plan (3 per calendar month)
    const { data: profile } = await supabase.from('profiles').select('plan').eq('user_id', userId).single()
    if ((profile?.plan ?? 'free') === 'free') {
      const monthStart = new Date()
      monthStart.setUTCDate(1)
      monthStart.setUTCHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('forms')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString())
      if ((count ?? 0) >= 3) return NextResponse.json({ error: 'Free plan allows up to 3 new forms per month. Upgrade to create more.' }, { status: 402 })
    }

    const form = await createFormDraft(userId, parsed.data)
    // Log creation for monthly usage counting independent of deletes
    try {
      await supabase.from('form_creations').insert({ user_id: userId, form_id: form.id })
    } catch {}
    // Revalidate dashboard cache for this user
    // We don't import revalidateTag here to keep cold-start small; dynamic import
    const { revalidateTag } = await import('next/cache')
    revalidateTag(`dashboard:user:${userId}`)
    return NextResponse.json({ formId: form.id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

