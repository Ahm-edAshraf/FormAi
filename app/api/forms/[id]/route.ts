import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { revalidateTag } from 'next/cache'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ensure owner
    const { data: form } = await supabase
      .from('forms')
      .select('id,user_id')
      .eq('id', params.id)
      .single()
    if (!form || (form as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('forms').delete().eq('id', params.id)
    if (error) throw error

    revalidateTag(`dashboard:user:${user.id}`)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const updates: any = {}
    if (typeof body?.title === 'string') updates.title = body.title
    if (typeof body?.description === 'string' || body?.description === null) updates.description = body.description
    if (typeof body?.allow_multiple_responses === 'boolean') updates.allow_multiple_responses = body.allow_multiple_responses
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No updates provided' }, { status: 400 })

    // Owner check
    const { data: form } = await supabase
      .from('forms')
      .select('id,user_id')
      .eq('id', params.id)
      .single()
    if (!form || (form as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('forms').update(updates).eq('id', params.id)
    if (error) throw error

    // Revalidate dashboard cache for owner
    revalidateTag(`dashboard:user:${user.id}`)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}


