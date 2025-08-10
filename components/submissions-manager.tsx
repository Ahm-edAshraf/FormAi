'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter, Download, Eye, Trash2, MoreHorizontal, Calendar, Users, TrendingUp, ArrowLeft, Sparkles, Zap, File as FileIcon, Link as LinkIcon, Copy as CopyIcon } from 'lucide-react'
import Image from 'next/image'
import { fetchSubmissions, type SubmissionRow } from '@/lib/data/submissions.client'
import { createClient as createSupabaseBrowser } from '@/utils/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface SubmissionsManagerProps {
  formId: string
}

export function SubmissionsManager({ formId }: SubmissionsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250)
    return () => clearTimeout(t)
  }, [searchQuery])
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null)
  const [rows, setRows] = useState<SubmissionRow[]>([])
  const [fieldLabelById, setFieldLabelById] = useState<Record<string, string>>({})
  const [viewsCount, setViewsCount] = useState<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    ;(async () => {
      try {
        const supabase = createSupabaseBrowser()
        // Pull latest submissions
        const { data, error } = await supabase
          .from('submissions')
          .select('id, created_at, data')
          .eq('form_id', formId)
          .order('created_at', { ascending: false })
        if (error) throw error
        setRows((data as any) || [])

        // Load field labels so we can show readable labels for IDs
        const { data: fields } = await supabase
          .from('form_fields')
          .select('id,label')
          .eq('form_id', formId)
        const mapping: Record<string, string> = {}
        for (const f of fields ?? []) mapping[(f as any).id] = (f as any).label
        setFieldLabelById(mapping)

        // Views for conversion rate
        const { count: vCount } = await supabase
          .from('form_views')
          .select('id', { count: 'exact', head: true })
          .eq('form_id', formId)
        setViewsCount(vCount ?? 0)
      } catch (err: any) {
        toast({ title: 'Failed to load submissions', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
      }
    })()
  }, [formId, toast])

  // For very large lists we could virtualize; add simple memo now
  const parentRef = useRef<HTMLDivElement | null>(null)
  const filtered = useMemo(() => rows.filter((f) => {
    const q = debouncedQuery.toLowerCase()
    return q.length === 0 || JSON.stringify(f.data || {}).toLowerCase().includes(q)
  }), [rows, debouncedQuery])
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 8,
  })

  const stats = {
    totalSubmissions: rows.length,
    todaySubmissions: rows.filter((r: any) => new Date(r.created_at).toDateString() === new Date().toDateString()).length,
    conversionRate: viewsCount > 0 ? Math.round((rows.length / viewsCount) * 100) : 0,
    averageTime: '-'
  }

  const getValueByLabelKeywords = (data: Record<string, any>, keywords: string[]): any => {
    for (const [id, value] of Object.entries(data)) {
      const label = (fieldLabelById[id] || '').toLowerCase()
      if (keywords.some((k) => label.includes(k))) return value
    }
    // Fallback: direct key match if user used textual keys
    for (const [key, value] of Object.entries(data)) {
      if (keywords.some((k) => key.toLowerCase().includes(k))) return value
    }
    return undefined
  }

  type FileItem = {
    submissionId: string
    createdAt: string
    fieldId: string
    label: string
    url: string
    name: string
    isImage: boolean
  }

  const extractFiles = (rows: SubmissionRow[]): FileItem[] => {
    const items: FileItem[] = []
    for (const r of rows) {
      for (const [key, value] of Object.entries(r.data || {})) {
        const pushItem = (val: any) => {
          const link = typeof val === 'string' ? val : (val?.url || '')
          if (!/^https?:\/\//i.test(link)) return
          const lower = link.toLowerCase()
          const isImage = /\.(png|jpe?g|gif|webp)$/i.test(lower)
          const name = decodeURIComponent((typeof val === 'string' ? link : (val?.name || link.split('/').pop())) || 'file')
          items.push({
            submissionId: r.id,
            createdAt: r.created_at,
            fieldId: key,
            label: fieldLabelById[key] || key,
            url: link,
            name,
            isImage,
          })
        }
        if (Array.isArray(value)) {
          for (const v of value) pushItem(v)
        } else {
          pushItem(value)
        }
      }
    }
    return items.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1)
  }

  const fileItems = extractFiles(rows)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-white inline-flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </a>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Customer Feedback Survey</h1>
                  <p className="text-sm text-slate-400">Submissions Manager</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-slate-600 text-white">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <a href={`/api/analytics/export?formId=${formId}`} className="inline-flex items-center border-slate-600 text-white border rounded-md px-3 h-9">
                <Download className="w-4 h-4 mr-2" />
                Export
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
            { label: 'Total Submissions', value: stats.totalSubmissions, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Today', value: stats.todaySubmissions, icon: Calendar, color: 'from-green-500 to-emerald-500' },
            { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: Zap, color: 'from-purple-500 to-pink-500' },
            { label: 'Avg. Time', value: stats.averageTime, icon: TrendingUp, color: 'from-orange-500 to-red-500' }
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

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="submissions" className="text-white">Submissions</TabsTrigger>
            <TabsTrigger value="files" className="text-white">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-white">Form Submissions</CardTitle>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600 text-white w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Desktop/tablet: virtualized table; Mobile: card list */}
                <div className="hidden sm:block">
                  <div ref={parentRef} className="rounded-lg border border-slate-700 overflow-auto max-h-[60vh]">
                    <Table style={{ height: rowVirtualizer.getTotalSize() }}>
                      <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800/50 sticky top-0 bg-slate-900/80 backdrop-blur">
                          <TableHead className="text-slate-300">Submitted</TableHead>
                          <TableHead className="text-slate-300">Name</TableHead>
                          <TableHead className="text-slate-300">Email</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300 w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody style={{ position: 'relative' }}>
                        {rowVirtualizer.getVirtualItems().map((vi) => {
                          const submission = filtered[vi.index]
                          return (
                            <TableRow
                              key={submission.id}
                              data-index={vi.index}
                              style={{ position: 'absolute', top: 0, transform: `translateY(${vi.start}px)` }}
                              className="border-slate-700 hover:bg-slate-800/30 cursor-pointer w-full"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <TableCell className="text-slate-300">{new Date(submission.created_at).toLocaleString()}</TableCell>
                              <TableCell className="text-white font-medium">{getValueByLabelKeywords(submission.data as any, ['name','full name']) ?? '-'}</TableCell>
                              <TableCell className="text-slate-300">{getValueByLabelKeywords(submission.data as any, ['email']) ?? '-'}</TableCell>
                              <TableCell><Badge variant="default">completed</Badge></TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-red-400 hover:text-red-300" title="Delete" onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    const supabase = createSupabaseBrowser()
                                    const { error } = await supabase.from('submissions').delete().eq('id', submission.id)
                                    if (error) throw error
                                    setRows(rows.filter((r) => r.id !== submission.id))
                                    toast({ title: 'Deleted' })
                                  } catch (err: any) {
                                    toast({ title: 'Delete failed', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
                                  }
                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {filtered.map((submission) => (
                    <div key={submission.id} className="p-4 rounded-lg border border-slate-700 bg-slate-900/50" onClick={() => setSelectedSubmission(submission)}>
                      <div className="text-xs text-slate-400 mb-1">{new Date(submission.created_at).toLocaleString()}</div>
                      <div className="text-white font-medium">
                        {getValueByLabelKeywords(submission.data as any, ['name','full name']) ?? '-'}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {getValueByLabelKeywords(submission.data as any, ['email']) ?? '-'}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="default">completed</Badge>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-red-400 hover:text-red-300"
                          title="Delete"
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              const supabase = createSupabaseBrowser()
                              const { error } = await supabase.from('submissions').delete().eq('id', submission.id)
                              if (error) throw error
                              setRows(rows.filter((r) => r.id !== submission.id))
                              toast({ title: 'Deleted' })
                            } catch (err: any) {
                              toast({ title: 'Delete failed', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
        <TabsContent value="files">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              {fileItems.length === 0 ? (
                <div className="text-slate-400">No files found for this form.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
               {fileItems
                    .filter((f) =>
                      [f.label, f.name].some((s) => s.toLowerCase().includes(debouncedQuery.toLowerCase()))
                    )
                    .map((f) => (
                    <div key={`${f.submissionId}:${f.url}`} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-400 truncate" title={f.label}>{f.label}</div>
                        <div className="text-xs text-slate-500" title={new Date(f.createdAt).toLocaleString()}>
                          {new Date(f.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mb-3 rounded-md overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center h-40">
                        {f.isImage ? (
                          <Image src={f.url} alt={f.name} width={320} height={160} className="object-contain w-full h-full" />
                        ) : (
                          <div className="flex items-center gap-2 text-slate-300"><FileIcon className="w-5 h-5" /> {f.name}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-300 hover:text-blue-200 text-sm">
                          <LinkIcon className="w-4 h-4 mr-1" /> View
                        </a>
                        <a href={f.url} download className="inline-flex items-center text-slate-300 hover:text-slate-200 text-sm">
                          <Download className="w-4 h-4 mr-1" /> Download
                        </a>
                        <button
                          className="inline-flex items-center text-slate-300 hover:text-slate-200 text-sm"
                          onClick={() => navigator.clipboard.writeText(f.url)}
                        >
                          <CopyIcon className="w-4 h-4 mr-1" /> Copy link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>

      {/* Submission Detail Modal */}
              {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Submission Details</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-400 mb-4">
                Submitted on {new Date((selectedSubmission as any).created_at).toLocaleString()}
              </div>
              {(() => {
                const files = extractFiles([selectedSubmission!])
                if (files.length === 0) return null
                return (
                  <div className="space-y-3">
                    <div className="text-white font-medium">Files</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {files.map((f) => (
                        <div key={f.url} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="text-sm text-slate-300 mb-2 truncate" title={f.label}>{f.label}</div>
                          <div className="rounded overflow-hidden bg-slate-900 border border-slate-700 h-40 flex items-center justify-center mb-2">
                            {f.isImage ? (
                              <Image src={f.url} alt={f.name} width={320} height={160} className="object-contain w-full h-full" />
                            ) : (
                              <div className="flex items-center gap-2 text-slate-300"><FileIcon className="w-5 h-5" /> {f.name}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-300 hover:text-blue-200 text-xs">
                              <LinkIcon className="w-3 h-3 mr-1" /> View
                            </a>
                            <a href={f.url} download className="inline-flex items-center text-slate-300 hover:text-slate-200 text-xs">
                              <Download className="w-3 h-3 mr-1" /> Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
              
              {Object.entries(selectedSubmission.data).map(([key, value]) => {
                const v = value as any
                const isImage = typeof v === 'string' && /\.(png|jpe?g|gif|webp)$/i.test(v)
                const isUrl = typeof v === 'string' && /^https?:\/\//i.test(v)
                const label = fieldLabelById[key] || key
                return (
                  <div key={key} className="space-y-2">
                    <p className="text-slate-300 font-medium">{label}</p>
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      {isImage ? (
                        <Image src={v} alt={label} width={512} height={256} className="max-h-64 rounded object-contain w-full h-auto" />
                      ) : isUrl ? (
                        <a href={v} target="_blank" rel="noreferrer" className="text-blue-300 underline break-all">{v}</a>
                      ) : Array.isArray(v) ? (
                        <p className="text-white break-all">{v.join(', ')}</p>
                      ) : (
                        <p className="text-white break-all">{String(v)}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
