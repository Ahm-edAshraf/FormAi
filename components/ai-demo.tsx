'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Loader2 } from 'lucide-react'

export function AIDemo() {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [autoText, setAutoText] = useState('')
  const typingTimer = useRef<NodeJS.Timeout | null>(null)
  const actionTimer = useRef<NodeJS.Timeout | null>(null)
  const generateBtnRef = useRef<HTMLButtonElement | null>(null)

  const handleGenerate = async () => {
    if (!description.trim()) return
    
    setIsGenerating(true)
    setShowForm(false)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsGenerating(false)
    setShowForm(true)
  }

  // Auto-playing demo: type prompt, then auto-click the generate button
  useEffect(() => {
    const script = 'RSVP for wedding with meal options, dietary restrictions, and guest count'
    let i = 0
    const type = () => {
      setAutoText(script.slice(0, i))
      setDescription(script.slice(0, i))
      i += 1
      if (i <= script.length) {
        typingTimer.current = setTimeout(type, 35)
      } else {
        actionTimer.current = setTimeout(() => {
          // Prefer simulating a real click so we use the latest state & handlers
          if (generateBtnRef.current) {
            generateBtnRef.current.click()
          } else {
            // Fallback: drive the sequence manually if ref is missing
            setIsGenerating(true)
            setShowForm(false)
            setTimeout(() => { setIsGenerating(false); setShowForm(true) }, 2000)
          }
        }, 400)
      }
    }
    type()
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
      if (actionTimer.current) clearTimeout(actionTimer.current)
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const demoForm = {
    title: 'Wedding RSVP Form',
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email Address', required: true },
      { type: 'select', label: 'Meal Preference', options: ['Chicken', 'Vegetarian', 'Vegan'] },
      { type: 'number', label: 'Number of Guests', required: true },
      { type: 'checkbox', label: 'Dietary Restrictions', options: ['Gluten-free', 'Nut allergy', 'Other'] },
      { type: 'textarea', label: 'Special Requests' }
    ]
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            Try the AI Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <Label className="text-white text-lg">Describe your form:</Label>
              <Textarea
                placeholder="e.g., RSVP for wedding with meal options, dietary restrictions, and guest count"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 transition-colors"
              />
              <Button
                ref={generateBtnRef}
                onClick={handleGenerate}
                disabled={!description.trim() || isGenerating}
                className="w-full glow-effect bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Form
                  </>
                )}
              </Button>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <Label className="text-white text-lg">Generated Form Preview:</Label>
              <div className="bg-slate-900/50 rounded-lg p-6 min-h-96 border border-slate-700">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-full"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse-glow">
                          <Sparkles className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <p className="text-slate-300">AI is crafting your perfect form...</p>
                      </div>
                    </motion.div>
                  ) : showForm ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-white mb-6">{demoForm.title}</h3>
                      
                      {demoForm.fields.map((field, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <Label className="text-slate-300">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </Label>
                          
                          {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                            <Input
                              type={field.type}
                              className="bg-slate-800/50 border-slate-600 text-white"
                              disabled
                            />
                          ) : field.type === 'select' ? (
                            <Select disabled>
                              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option.toLowerCase()}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'textarea' ? (
                            <Textarea
                              className="bg-slate-800/50 border-slate-600 text-white"
                              disabled
                            />
                          ) : field.type === 'checkbox' ? (
                            <div className="space-y-2">
                              {field.options?.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox disabled />
                                  <Label className="text-slate-400">{option}</Label>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </motion.div>
                      ))}
                      
                      <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600" disabled>
                        Submit RSVP
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-full text-slate-500"
                    >
                      Your generated form will appear here...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
