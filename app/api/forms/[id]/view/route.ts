import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: userData } = await supabase.auth.getUser()
    const cookieName = `v_${params.id}`
    let visitor = cookieStore.get(cookieName)?.value
    if (!visitor) visitor = crypto.randomUUID()

    await supabase.from('form_views').insert({
      form_id: params.id,
      user_id: userData?.user?.id ?? null,
      visitor_token: visitor,
    })

    const res = NextResponse.json({ ok: true })
    // Persist visitor token for one year
    res.cookies.set(cookieName, visitor, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

export const runtime = 'edge'
export const preferredRegion = 'auto'


