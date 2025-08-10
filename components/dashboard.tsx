'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, BarChart3, Users, Zap, Crown, Sparkles, LogOut } from 'lucide-react'
import { AIGeneratorModal } from '@/components/ai-generator-modal'
import { createClient as createSupabaseBrowser } from '@/utils/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRouter } from 'next/navigation'
import { MobileNav } from '@/components/mobile-nav'

export function Dashboard({ initialRows, initialTotals }: { initialRows?: any[]; initialTotals?: { totalForms: number; totalSubmissions: number; totalViews: number; conversionRate: number } } = {}) {
  const [showAIModal, setShowAIModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>(initialRows ?? [])
  const [totals, setTotals] = useState(initialTotals ?? { totalForms: 0, totalSubmissions: 0, totalViews: 0, conversionRate: 0 })
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    if (!isMobile) return
    const KEY = 'formai:desktop-suggest-toast'
    try {
      if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(KEY)) {
        toast({
          title: 'Best on desktop',
          description: 'Form editing features are optimized for desktop. Consider switching to a computer for building/editing forms.',
        })
        sessionStorage.setItem(KEY, '1')
      }
    } catch {}
  }, [isMobile, toast])

  useEffect(() => {
    if (initialRows) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        setLoading(true)
        const supabase = createSupabaseBrowser()
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id
        if (!userId) {
          toast({ title: 'Please sign in', description: 'Sign in to view your dashboard.' })
          return
        }
        const { data: forms, error } = await supabase
          .from('forms')
          .select('id,title,description,status,slug,created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (error) throw error
        // Count submissions per form in parallel
        const counts = await Promise.all(
          (forms ?? []).map(async (f) => {
            const { count } = await supabase
              .from('submissions')
              .select('id', { count: 'exact', head: true })
              .eq('form_id', f.id)
            return { formId: f.id, count: count ?? 0 }
          })
        )
        // Count views per form
        const viewCounts = await Promise.all(
          (forms ?? []).map(async (f) => {
            const { count } = await supabase
              .from('form_views')
              .select('id', { count: 'exact', head: true })
              .eq('form_id', f.id)
            return { formId: f.id, count: count ?? 0 }
          })
        )

        const rows = (forms ?? []).map((f) => ({
          id: f.id,
          title: f.title,
          description: f.description ?? '',
          status: f.status,
          slug: f.slug,
          createdAt: new Date(f.created_at).toISOString().slice(0, 10),
          submissions: counts.find((c) => c.formId === f.id)?.count ?? 0,
          views: viewCounts.find((v) => v.formId === f.id)?.count ?? 0,
          isAIGenerated: true,
        }))
        setRows(rows)
        const totalSubmissions = rows.reduce((acc, r) => acc + r.submissions, 0)
        const totalViews = rows.reduce((acc, r) => acc + r.views, 0)
        const conversionRate = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0
        setTotals({ totalForms: rows.length, totalSubmissions, totalViews, conversionRate })
      } catch (err: any) {
        toast({ title: 'Failed to load dashboard', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
      } finally {
        setLoading(false)
      }
    })()
  }, [toast, initialRows])

  const usage = useMemo(() => ({
    formsUsed: totals.totalForms,
    formsLimit: Infinity,
    submissionsUsed: totals.totalSubmissions,
    submissionsLimit: Infinity,
  }), [totals])

  const listParentRef = useRef<HTMLDivElement | null>(null)
  const filteredRows = useMemo(() => rows.filter((f) => f.title.toLowerCase().includes(debouncedQuery.toLowerCase())), [rows, debouncedQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FormAI
            </span>
          </div>
          
          <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" className="text-white" onClick={() => { router.prefetch('/analytics'); router.push('/analytics') }}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
              <Button variant="ghost" className="text-white" onClick={() => { router.prefetch('/settings'); router.push('/settings') }}>
              Settings
            </Button>
              <Button variant="ghost" className="text-white" onClick={() => { router.prefetch('/billing'); router.push('/billing') }}>
              <Crown className="w-4 h-4 mr-2" />
              Billing
            </Button>
              <Button
                variant="ghost"
                className="text-white"
                onClick={async () => {
                  try {
                    const supabase = createSupabaseBrowser()
                    await supabase.auth.signOut()
                  } finally {
                    router.push('/')
                  }
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            <div className="hidden sm:block w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />
          </div>
          <div className="sm:hidden">
            <MobileNav />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Manage your AI-powered forms</p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" className="glow-effect bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4 lg:mt-0" onClick={() => setShowAIModal(true)}>
              <Plus className="w-5 h-5 mr-2" /> Create New Form
            </Button>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[
              { label: 'Total Forms', value: totals.totalForms, icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
              { label: 'Total Submissions', value: totals.totalSubmissions, icon: Users, color: 'from-green-500 to-emerald-500' },
              { label: 'Total Views', value: totals.totalViews, icon: Eye, color: 'from-purple-500 to-pink-500' },
              { label: 'Conversion Rate', value: `${totals.conversionRate}%`, icon: Zap, color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-tilt bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Usage Meters */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 mb-6 md:mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Usage Overview
            </CardTitle>
            <CardDescription className="text-slate-400">
              Track your current plan usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Forms Created</span>
                <span className="text-slate-300">{usage.formsUsed}</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Submissions</span>
                <span className="text-slate-300">{usage.submissionsUsed}</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" className="border-slate-600 text-white" onClick={() => router.push('/billing')}>
                <Crown className="w-4 h-4 mr-2" /> Manage Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forms Section */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-white">Your Forms</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage and track your form performance
                </CardDescription>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={listParentRef} className="space-y-4 max-h-[60vh] overflow-auto">
              {filteredRows.map((form) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {form.title}
                        </h3>
                        {form.isAIGenerated && (
                          <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
                          {form.status}
                        </Badge>
                      </div>
                      <p className="text-slate-400 mb-4">{form.description}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {form.submissions} submissions
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {form.views} views
                        </span>
                        <span>Created {form.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => form.slug ? window.open(`/f/${form.slug}`, '_blank') : undefined} disabled={!form.slug} title={form.slug ? 'Open public form' : 'Publish to get a public URL'}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.push(`/editor/${form.id}`)} title="Edit form">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.push(`/submissions/${form.id}`)} title="View submissions">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" title="Delete form" onClick={async () => {
                        if (!confirm('Delete this form? This cannot be undone.')) return
                        try {
                          const res = await fetch(`/api/forms/${form.id}`, { method: 'DELETE' })
                          if (!res.ok) {
                            const body = await res.json().catch(() => ({}))
                            throw new Error(body.error || 'Delete failed')
                          }
                          setRows(rows.filter(r => r.id !== form.id))
                          toast({ title: 'Form deleted' })
                        } catch (err: any) {
                          toast({ title: 'Delete failed', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
                        }
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AIGeneratorModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  )
}
