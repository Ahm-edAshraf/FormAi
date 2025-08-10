import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''
  const str = Array.isArray(value) ? value.join('; ') : String(value)
  if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"'
  return str
}

function toCSV(headers: string[], rows: Record<string, any>[]): string {
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(headers.map((h) => escapeCSV(r[h])).join(','))
  }
  return lines.join('\n') + '\n'
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const formId = url.searchParams.get('formId')
    const formIdsParam = url.searchParams.get('formIds')
    const cookieStore = cookies()
    const supabase = createSupabaseServer(cookieStore)
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Determine scope
    let formIds: string[] = []
    if (formId) formIds = [formId]
    else if (formIdsParam) formIds = formIdsParam.split(',').map((s) => s.trim()).filter(Boolean)
    else {
      const { data: owned } = await supabase.from('forms').select('id').eq('user_id', userId)
      formIds = (owned ?? []).map((f: any) => f.id)
    }
    if (formIds.length === 0) return NextResponse.json({ error: 'No forms to export' }, { status: 400 })

    const { data: forms } = await supabase.from('forms').select('id,title').in('id', formIds).eq('user_id', userId)
    const idToTitle = new Map((forms ?? []).map((f: any) => [f.id, f.title]))
    const { data: fields } = await supabase
      .from('form_fields')
      .select('id,label,form_id')
      .in('form_id', Array.from(idToTitle.keys()))

    const fieldIdToLabel = new Map((fields ?? []).map((x: any) => [x.id, x.label]))

    const { data: subs } = await supabase
      .from('submissions')
      .select('id, form_id, created_at, data')
      .in('form_id', Array.from(idToTitle.keys()))
      .order('created_at', { ascending: true })

    // Build dynamic headers: static + union of field labels
    const staticHeaders = ['Form Title','Submission ID','Submitted At']
    const labelSet = new Set<string>()
    for (const s of subs ?? []) {
      const data = s.data || {}
      for (const key of Object.keys(data)) {
        const label = fieldIdToLabel.get(key) || key
        labelSet.add(label)
      }
    }
    const labelHeaders = Array.from(labelSet)
    const headers = [...staticHeaders, ...labelHeaders]

    const rows = (subs ?? []).map((s: any) => {
      const row: Record<string, any> = {
        'Form Title': idToTitle.get(s.form_id) ?? '',
        'Submission ID': s.id,
        'Submitted At': new Date(s.created_at).toISOString(),
      }
      const data = s.data || {}
      for (const key of Object.keys(data)) {
        const label = fieldIdToLabel.get(key) || key
        row[label] = data[key]
      }
      // ensure missing headers present
      for (const h of labelHeaders) if (!(h in row)) row[h] = ''
      return row
    })

    const csv = toCSV(headers, rows)
    const response = new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="formai-export.csv"`,
        // allow CDN caching for 5 minutes; user-specific scope by auth prevents shared caching
        'Cache-Control': 'private, max-age=300, must-revalidate',
      },
    })
    return response
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Export failed' }, { status: 500 })
  }
}


