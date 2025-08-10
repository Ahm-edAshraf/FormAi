'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Loader2, RefreshCw, Check, Edit, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AIGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AIGeneratorModal({ isOpen, onClose }: AIGeneratorModalProps) {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [spec, setSpec] = useState<any | null>(null)
  const { toast } = useToast()

  const generationSteps = [
    'Analyzing your description...',
    'Identifying form fields...',
    'Setting up validation rules...',
    'Generating form structure...',
    'Applying styling...',
    'Finalizing your form...'
  ]

  const handleGenerate = async () => {
    if (!description.trim()) return
    
    setIsGenerating(true)
    setShowPreview(false)
    setGenerationStep(0)

    // Animate progress while request is in flight
    const progress = async () => {
      for (let i = 0; i < generationSteps.length; i++) {
        setGenerationStep(i)
        await new Promise(resolve => setTimeout(resolve, 600))
      }
    }

    try {
      const [res] = await Promise.all([
        fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
        }),
        progress(),
      ])
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to generate form')
      }
      const { spec } = await res.json()
      setSpec(spec)
      setShowPreview(true)
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAccept = async () => {
    if (!spec) return
    // Create draft form server-side via a POST to a forms endpoint
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to create form')
      }
      const { formId } = await res.json()
      window.location.href = `/editor/${formId}`
    } catch (err: any) {
      toast({ title: 'Failed to create form', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
    }
  }

  const generatedForm = {
    title: 'Customer Feedback Survey',
    confidence: 94,
    fields: [
      { type: 'text', label: 'Full Name', required: true, confidence: 98 },
      { type: 'email', label: 'Email Address', required: true, confidence: 96 },
      { type: 'select', label: 'Service Rating', options: ['Excellent', 'Good', 'Fair', 'Poor'], confidence: 92 },
      { type: 'textarea', label: 'Additional Comments', required: false, confidence: 89 },
      { type: 'checkbox', label: 'Subscribe to Newsletter', required: false, confidence: 85 }
    ]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            AI Form Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Describe Your Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., Customer feedback survey with rating scale, contact info, and optional newsletter signup"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                disabled={isGenerating}
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!description.trim() || isGenerating}
                  className="glow-effect bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Form
                    </>
                  )}
                </Button>
                
                {showPreview && (
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    className="border-slate-600 text-white hover:border-slate-500"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse-glow">
                        <Sparkles className="w-8 h-8 text-white animate-spin" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {generationSteps[generationStep]}
                      </h3>
                      <Progress value={((generationStep + 1) / generationSteps.length) * 100} className="w-full max-w-md mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Form Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                       <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                             Generated Form Preview
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border-green-500/30">
                           AI
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Form Structure */}
                      <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">{spec?.title}</h3>
                        
                            {spec?.fields?.map((field: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{field.label}</span>
                                {field.required && <span className="text-red-400">*</span>}
                              </div>
                                  <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                            </div>
                            
                            <div className="text-sm text-slate-400 mb-2">
                              Type: <span className="text-blue-400">{field.type}</span>
                            </div>
                            
                            {field.options && (
                              <div className="text-sm text-slate-400">
                                Options: {field.options.join(', ')}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {/* Live Preview */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Live Preview</h4>
                        <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
                              <h3 className="text-xl font-semibold text-white">{spec?.title}</h3>
                          
                              {spec?.fields?.map((field: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <label className="text-slate-300 text-sm">
                                {field.label}
                                {field.required && <span className="text-red-400 ml-1">*</span>}
                              </label>
                              
                              {field.type === 'text' || field.type === 'email' ? (
                                <div className="h-10 bg-slate-800 border border-slate-600 rounded-md" />
                              ) : field.type === 'select' ? (
                                <div className="h-10 bg-slate-800 border border-slate-600 rounded-md flex items-center px-3">
                                  <span className="text-slate-500">Select an option</span>
                                </div>
                              ) : field.type === 'textarea' ? (
                                <div className="h-20 bg-slate-800 border border-slate-600 rounded-md" />
                              ) : field.type === 'checkbox' ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 bg-slate-800 border border-slate-600 rounded" />
                                  <span className="text-slate-400 text-sm">{field.label}</span>
                                </div>
                              ) : null}
                            </div>
                          ))}
                          
                          <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600" disabled>
                            Submit Form
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-white hover:border-slate-500"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-white hover:border-slate-500"
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    className="glow-effect bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onClick={handleAccept}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Form
                  </Button>
                  <Button
                    className="glow-effect bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleAccept}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept & Continue
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
