import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { Dashboard } from '@/components/dashboard'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createSupabaseServer(cookieStore)
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return <Dashboard />

  const load = unstable_cache(async (uid: string) => {
    const { data: forms } = await supabase
      .from('forms')
      .select('id,title,description,status,slug,created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (!forms || forms.length === 0) {
      return { rows: [], totals: { totalForms: 0, totalSubmissions: 0, totalViews: 0, conversionRate: 0 } }
    }
    const formIds = forms.map((f: any) => f.id)
    const { count: totalSubmissions } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .in('form_id', formIds)
    const { count: totalViews } = await supabase
      .from('form_views')
      .select('id', { count: 'exact', head: true })
      .in('form_id', formIds)
    // Per-form counts: prefer RPC (see fallback below)
    let counts: Array<{ formId: string; submissions: number; views: number }> = []
    // Prefer RPC if enabled
    try {
      const { data: c } = await supabase.rpc('form_counts', { form_ids: formIds })
      counts = (c as any[])?.map((x) => ({ formId: x.form_id, submissions: x.submissions, views: x.views })) ?? []
    } catch {
      counts = await Promise.all(
        forms.map(async (f: any) => {
          const [{ count: s }, { count: v }] = await Promise.all([
            supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('form_id', f.id),
            supabase.from('form_views').select('id', { count: 'exact', head: true }).eq('form_id', f.id),
          ])
          return { formId: f.id, submissions: s ?? 0, views: v ?? 0 }
        })
      )
    }
    const rows = forms.map((f: any) => {
      const c = counts.find((x) => x.formId === f.id) || { submissions: 0, views: 0 }
      return {
        id: f.id,
        title: f.title,
        description: f.description ?? '',
        status: f.status,
        slug: f.slug,
        createdAt: new Date(f.created_at).toISOString().slice(0, 10),
        submissions: c.submissions,
        views: c.views,
        isAIGenerated: true,
      }
    })
    const totals = {
      totalForms: rows.length,
      totalSubmissions: rows.reduce((a: number, r: any) => a + r.submissions, 0),
      totalViews: rows.reduce((a: number, r: any) => a + r.views, 0),
      conversionRate: rows.reduce((a: number, r: any) => a + r.views, 0) > 0
        ? Math.round((rows.reduce((a: number, r: any) => a + r.submissions, 0) / Math.max(1, rows.reduce((a: number, r: any) => a + r.views, 0))) * 100)
        : 0,
    }
    return { rows, totals }
  }, ['dashboard-initial', userId ?? ''], { revalidate: 15, tags: ['dashboard', `dashboard:user:${userId}`] })

  const { rows, totals } = await load(userId)
  return <Dashboard initialRows={rows} initialTotals={totals} />
}
