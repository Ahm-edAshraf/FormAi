import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const fileExt = file.name.split('.').pop()
    const filePath = `${params.id}/${crypto.randomUUID()}.${fileExt}`

    const supabase = createSupabaseServer(cookies())
    const { data: form } = await supabase
      .from('forms')
      .select('id,user_id')
      .eq('id', params.id)
      .single()
    if (!form || form.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase.storage
      .from('form-uploads')
      .upload(filePath, file, { upsert: false })
    if (error) throw error

    const { data: urlData } = await supabase.storage
      .from('form-uploads')
      .getPublicUrl(filePath)

    return NextResponse.json({ path: data.path, url: urlData.publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Upload failed' }, { status: 500 })
  }
}

