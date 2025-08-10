import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { MobileNav } from '@/components/mobile-nav'
import { BarChart3, Download, Eye, Users, Zap, ArrowLeft, Sparkles, FileDown } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = createSupabaseServer(cookies())
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  let totals = { forms: 0, submissions: 0, views: 0 }
  let forms: any[] = []
  if (userId) {
    const formsRes = await supabase.from('forms').select('id,title,status,slug,created_at').eq('user_id', userId)
    forms = formsRes.data ?? []
    const formIds = forms.map((f: any) => f.id)
    if (formIds.length) {
      const [{ count: subCount }, { count: viewCount }] = await Promise.all([
        supabase.from('submissions').select('id', { count: 'exact', head: true }).in('form_id', formIds),
        supabase.from('form_views').select('id', { count: 'exact', head: true }).in('form_id', formIds),
      ])
      totals = { forms: formIds.length, submissions: subCount ?? 0, views: viewCount ?? 0 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="border-b border-slate-800 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-white inline-flex items-center text-sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Analytics</span>
          </div>
          <div className="sm:hidden"><MobileNav /></div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50"><CardHeader><CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Total Forms</CardTitle></CardHeader><CardContent><p className="text-3xl text-white">{totals.forms}</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Users className="w-5 h-5" /> Total Submissions</CardTitle></CardHeader><CardContent><p className="text-3xl text-white">{totals.submissions}</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Eye className="w-5 h-5" /> Total Views</CardTitle></CardHeader><CardContent><p className="text-3xl text-white">{totals.views}</p></CardContent></Card>
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5" /> Conversion</CardTitle></CardHeader><CardContent><p className="text-3xl text-white">{totals.views ? Math.round((totals.submissions / Math.max(totals.views, 1)) * 100) : 0}%</p></CardContent></Card>
      </div>

      <div className="container mx-auto px-6 pb-8">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2"><FileDown className="w-5 h-5" /> Export Data</CardTitle>
            <div className="flex items-center gap-3">
              <a className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200" href="/api/analytics/export">
                <Download className="w-4 h-4 mr-1" /> Export All
              </a>
              <form action="/api/analytics/export" method="get" className="flex items-center gap-2">
                <Input name="formIds" placeholder="Comma-separated form IDs" className="w-64 bg-slate-800 border-slate-600 text-white" />
                <Button type="submit" variant="outline" className="border-slate-600 text-white">
                  <Download className="w-4 h-4 mr-2" /> Export Selected
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {forms.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="text-slate-300">
                    <div className="text-white font-medium">{f.title}</div>
                    <div className="text-xs text-slate-500">{new Date(f.created_at).toLocaleDateString()}</div>
                  </div>
                  <a className="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm" href={`/api/analytics/export?formId=${f.id}`}>
                    <Download className="w-4 h-4 mr-1" /> CSV
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


