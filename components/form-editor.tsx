'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Type, Mail, Hash, Calendar, CheckSquare, List, FileText, Phone, Save, Eye, Share, Settings, Smartphone, Monitor, Sparkles, ArrowLeft } from 'lucide-react'
import { FieldLibrary } from '@/components/field-library'
import { FormCanvas } from '@/components/form-canvas'
import { PropertyInspector } from '@/components/property-inspector'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { MobileNav } from '@/components/mobile-nav'
import { fetchFormWithFields as fetchFormWithFieldsClient, saveFields, saveFormMeta } from '@/lib/data/forms.client'
import { createClient as createSupabaseBrowser } from '@/utils/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useEffect as ReactUseEffect } from 'react'


interface FormEditorProps {
  formId: string
}

export function FormEditor({ formId }: FormEditorProps) {
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [draggedField, setDraggedField] = useState<any>(null)
  const [formFields, setFormFields] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [allowMultiple, setAllowMultiple] = useState<boolean>(true)
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Prefer mobile preview on small screens by default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSmall = window.matchMedia('(max-width: 767px)').matches
      if (isSmall) setPreviewMode('mobile')
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const supabase = createSupabaseBrowser()
        const [{ data: userData }, { form, fields }] = await Promise.all([
          supabase.auth.getUser(),
          fetchFormWithFieldsClient(formId),
        ])
        if (!mounted) return
        const userId = userData?.user?.id
        if (!userId) {
          toast({ title: 'Please sign in', description: 'You must be signed in to edit forms.' })
          router.replace('/dashboard')
          return
        }
        if (form.user_id && form.user_id !== userId) {
          toast({ title: 'Access denied', description: 'You are not the owner of this form.' })
          router.replace('/dashboard')
          return
        }
        setFormTitle(form.title || '')
        setFormDescription(form.description || '')
        setFormFields(fields || [])
        setPublishedSlug(form.slug || null)
        setAllowMultiple(form.allow_multiple_responses ?? true)
      } catch (err: any) {
        toast({ title: 'Failed to load form', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
        router.replace('/dashboard')
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [formId, router, toast])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setDraggedField(active.data.current)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && over.id === 'form-canvas') {
      // Add new field to form only if source is library card (id starts with field-type)
      if (String(active.id).startsWith('field-')) {
        const newField = {
          id: crypto.randomUUID?.() || Date.now().toString(),
          type: active.data.current?.type || 'text',
          label: active.data.current?.label || 'New Field',
          placeholder: '',
          required: false,
          options: undefined,
        } as any
        if (newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') {
          newField.options = ['Option 1', 'Option 2']
        }
        setFormFields((prev) => [...prev, newField])
      }
    }
    
    setDraggedField(null)
  }

  const moveField = (fieldId: string, delta: number) => {
    setFormFields((fields) => {
      const index = fields.findIndex((f) => f.id === fieldId)
      if (index < 0) return fields
      const newIndex = Math.max(0, Math.min(fields.length - 1, index + delta))
      if (newIndex === index) return fields
      const copy = fields.slice()
      const [item] = copy.splice(index, 1)
      copy.splice(newIndex, 0, item)
      return copy
    })
  }

  const metaDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const fieldsDebounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (metaDebounceRef.current) clearTimeout(metaDebounceRef.current)
    metaDebounceRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        await saveFormMeta(formId, { title: formTitle, description: formDescription || null, allow_multiple_responses: allowMultiple })
        // Ensure server cache is fresh in case client and server caches diverge
        fetch(`/api/forms/${formId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: formTitle, description: formDescription || null, allow_multiple_responses: allowMultiple }) })
          .catch(() => {})
      } catch (err: any) {
        toast({ title: 'Failed to save', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
      } finally {
        setIsSaving(false)
      }
    }, 600)
    return () => {
      if (metaDebounceRef.current) clearTimeout(metaDebounceRef.current)
    }
  }, [formTitle, formDescription, allowMultiple, formId, isLoading, toast])

  useEffect(() => {
    if (isLoading) return
    if (fieldsDebounceRef.current) clearTimeout(fieldsDebounceRef.current)
    fieldsDebounceRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        await saveFields(formId, formFields.map((f, idx) => ({ ...f, position: idx })))
      } catch (err: any) {
        toast({ title: 'Failed to save fields', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
      } finally {
        setIsSaving(false)
      }
    }, 800)
    return () => {
      if (fieldsDebounceRef.current) clearTimeout(fieldsDebounceRef.current)
    }
  }, [formFields, formId, isLoading, toast])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveFormMeta(formId, { title: formTitle, description: formDescription || null, allow_multiple_responses: allowMultiple })
      await saveFields(formId, formFields.map((f, idx) => ({ ...f, position: idx })))
      toast({ title: 'Saved', description: 'Your changes have been saved.' })
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      setIsSaving(true)
      await saveFormMeta(formId, { title: formTitle, description: formDescription || null, allow_multiple_responses: allowMultiple })
      await saveFields(formId, formFields.map((f, idx) => ({ ...f, position: idx })))
      const res = await fetch(`/api/forms/${formId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: formTitle })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to publish')
      }
      const { slug } = await res.json()
      toast({ title: 'Published', description: `Form published at /f/${slug}` })
      setPublishedSlug(slug)
      // Auto-copy to clipboard
      const url = `${window.location.origin}/f/${slug}`
      navigator.clipboard.writeText(url).catch(() => {})
    } catch (err: any) {
      toast({ title: 'Publish failed', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 py-4">
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
                  <h1 className="text-lg font-semibold text-white">{formTitle || 'Untitled Form'}</h1>
                  <p className="text-sm text-slate-400">Form Editor {isSaving && <span className="text-xs text-slate-500">• saving…</span>}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  className="h-8 px-3"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  className="h-8 px-3"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm" className="border-slate-600 text-white">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              <Button variant="outline" size="sm" onClick={handleSave} className="border-slate-600 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handlePublish}
                  className="glow-effect bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
                  disabled={!formTitle || !!publishedSlug}
                  title={!formTitle ? 'Add a title to publish' : !!publishedSlug ? 'Already published' : 'Publish'}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                {/* Copy Link appears when published; we infer published when slug exists (not loaded here). */}
                <Button
                  size="sm"
                  variant="outline"
                  className={`border-slate-600 text-white ${publishedSlug ? 'inline-flex' : 'hidden'}`}
                  onClick={() => {
                    if (!publishedSlug) return
                    const url = `${window.location.origin}/f/${publishedSlug}`
                    navigator.clipboard.writeText(url)
                    toast({ title: 'Link copied', description: url })
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
            <div className="sm:hidden flex items-center gap-2">
              {/* Mobile toggles for side panels */}
              <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="border-slate-600 text-white">
                    Fields
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-slate-900 border-slate-800 p-0">
                  <SheetHeader className="px-4 py-3"><SheetTitle className="text-white">Field Library</SheetTitle></SheetHeader>
                  <div className="h-[calc(100vh-64px)] overflow-y-auto p-4">
                    <FieldLibrary />
                  </div>
                </SheetContent>
              </Sheet>
              <Sheet open={rightOpen} onOpenChange={setRightOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="border-slate-600 text-white">
                    Properties
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-slate-900 border-slate-800 p-0">
                  <SheetHeader className="px-4 py-3"><SheetTitle className="text-white">Properties</SheetTitle></SheetHeader>
                  <div className="h-[calc(100vh-64px)] overflow-y-auto p-4">
                    {!isLoading && (
                      <PropertyInspector
                        formTitle={formTitle}
                        formDescription={formDescription}
                        activeField={formFields.find(field => field.id === activeFieldId)}
                        onFormTitleChange={setFormTitle}
                        onFormDescriptionChange={setFormDescription}
                        onAllowMultipleChange={setAllowMultiple}
                        onFieldUpdate={(updates) => {
                          if (activeFieldId) {
                            setFormFields(fields => 
                              fields.map(field => 
                                field.id === activeFieldId ? { ...field, ...updates } : field
                              )
                            )
                          }
                        }}
                      />
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Panel - Field Library */}
          <div className="hidden md:block w-80 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-y-auto">
            <FieldLibrary />
          </div>

          {/* Center Panel - Form Canvas */}
          <div className="flex-1 overflow-y-auto">
            {!isLoading && (
            <FormCanvas
              formTitle={formTitle}
              formDescription={formDescription}
              fields={formFields}
              previewMode={previewMode}
              activeFieldId={activeFieldId}
              onFieldSelect={setActiveFieldId}
              onFieldUpdate={(fieldId, updates) => {
                setFormFields(fields => 
                  fields.map(field => 
                    field.id === fieldId ? { ...field, ...updates } : field
                  )
                )
              }}
              onFieldDelete={(fieldId) => {
                setFormFields(fields => fields.filter(field => field.id !== fieldId))
                setActiveFieldId(null)
              }}
              onFieldReorder={moveField}
            />)}
          </div>

          {/* Right Panel - Property Inspector */}
          <div className="hidden md:block w-80 border-l border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-y-auto">
            {!isLoading && (
            <PropertyInspector
              formTitle={formTitle}
              formDescription={formDescription}
              activeField={formFields.find(field => field.id === activeFieldId)}
              onFormTitleChange={setFormTitle}
              onFormDescriptionChange={setFormDescription}
              onAllowMultipleChange={setAllowMultiple}
              onFieldUpdate={(updates) => {
                if (activeFieldId) {
                  setFormFields(fields => 
                    fields.map(field => 
                      field.id === activeFieldId ? { ...field, ...updates } : field
                    )
                  )
                }
              }}
            />)}
          </div>
        </div>

        <DragOverlay>
          {draggedField ? (
            <Card className="w-64 bg-slate-800 border-slate-600 opacity-80">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <draggedField.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-white">{draggedField.label}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
