'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, GripVertical, Plus, Star, Calendar, Clock, Upload, Palette } from 'lucide-react'

// Child component so hooks count stays stable per item
function SortableField({
  field,
  index,
  isActive,
  onFieldSelect,
  onFieldDelete,
  onFieldReorder,
}: {
  field: any
  index: number
  isActive: boolean
  onFieldSelect: (id: string) => void
  onFieldDelete: (id: string) => void
  onFieldReorder?: (id: string, delta: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
        isActive ? 'border-blue-500 bg-blue-500/10' : 'border-transparent hover:border-slate-600 hover:bg-slate-800/30'
      }`}
      onClick={() => onFieldSelect(field.id)}
    >
      <div className={`absolute -top-2 right-2 flex items-center space-x-1 transition-opacity duration-200 ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <Button size="sm" variant="secondary" className="h-6 w-6 p-0" title="Move" {...attributes} {...listeners}>
          <GripVertical className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="secondary" className="h-6 w-6 p-0" title="Move up" onClick={(e) => { e.stopPropagation(); onFieldReorder?.(field.id, -1) }}>
          ↑
        </Button>
        <Button size="sm" variant="secondary" className="h-6 w-6 p-0" title="Move down" onClick={(e) => { e.stopPropagation(); onFieldReorder?.(field.id, +1) }}>
          ↓
        </Button>
        <Button size="sm" variant="secondary" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation() }}>
          <Edit className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="destructive" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); onFieldDelete(field.id) }}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-white flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-400">*</span>}
        </Label>

        {field.type === 'text' && (
          <Input placeholder={field.placeholder} className="bg-slate-800 border-slate-600 text-white" disabled />
        )}
        {field.type === 'textarea' && (
          <Textarea placeholder={field.placeholder} className="bg-slate-800 border-slate-600 text-white" disabled />
        )}
        {field.type === 'email' && (
          <Input type="email" placeholder={field.placeholder} className="bg-slate-800 border-slate-600 text-white" disabled />
        )}
        {field.type === 'number' && (
          <Input type="number" placeholder={field.placeholder} className="bg-slate-800 border-slate-600 text-white" disabled />
        )}

        {field.type === 'select' && (
          <Select disabled>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? ['Option 1','Option 2']).map((option: string) => (
                <SelectItem key={option} value={option.toLowerCase()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.type === 'checkbox' && (
          <div className="space-y-2">
            {(Array.isArray(field.options) ? field.options : ['Option 1','Option 2']).map((option: string) => (
              <label key={option} className="flex items-center space-x-2 text-slate-300">
                <input type="checkbox" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'radio' && (
          <RadioGroup disabled>
            {(Array.isArray(field.options) ? field.options : ['Option 1','Option 2']).map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option.toLowerCase()} disabled />
                <Label className="text-slate-300">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {field.type === 'date' && (
          <div className="relative">
            <Input type="date" className="bg-slate-800 border-slate-600 text-white" disabled />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        )}
        {field.type === 'time' && (
          <div className="relative">
            <Input type="time" className="bg-slate-800 border-slate-600 text-white" disabled />
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        )}
        {field.type === 'rating' && (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-slate-600" />
            ))}
          </div>
        )}
        {field.type === 'file' && (
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400">Click to upload or drag and drop</p>
          </div>
        )}
        {field.type === 'color' && (
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded border border-slate-600" />
            <Input type="text" value="#3B82F6" className="bg-slate-800 border-slate-600 text-white" disabled />
            <Palette className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface FormCanvasProps {
  formTitle: string
  formDescription: string
  fields: any[]
  previewMode: 'desktop' | 'mobile'
  activeFieldId: string | null
  onFieldSelect: (fieldId: string) => void
  onFieldUpdate: (fieldId: string, updates: any) => void
  onFieldDelete: (fieldId: string) => void
  onFieldReorder?: (fieldId: string, delta: number) => void
}

export function FormCanvas({
  formTitle,
  formDescription,
  fields,
  previewMode,
  activeFieldId,
  onFieldSelect,
  onFieldUpdate,
  onFieldDelete,
  onFieldReorder,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas'
  })

  // removed legacy renderField hook usage (now using SortableField only)

  return (
    <div className="p-4 md:p-6">
      <div className={`mx-auto transition-all duration-300 ${
        previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
      }`}>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{formTitle}</CardTitle>
            {formDescription && (
              <p className="text-slate-400">{formDescription}</p>
            )}
          </CardHeader>
          <CardContent
            ref={setNodeRef}
            className={`space-y-6 min-h-[60vh] border-2 border-dashed border-transparent ${
              isOver ? 'bg-blue-500/10 border-blue-500' : 'hover:border-slate-700'
            }`}
          >
            {/* Provide a generous drop zone at top and bottom */}
            <div className={`h-10 rounded ${isOver ? 'bg-blue-500/10' : 'bg-transparent'}`} />
            <SortableContext items={fields.map((f:any)=>f.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {fields.length > 0 ? (
                <SortableContext items={fields.map((f:any)=>f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field: any, index: number) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      index={index}
                      isActive={activeFieldId === field.id}
                      onFieldSelect={onFieldSelect}
                      onFieldDelete={onFieldDelete}
                      onFieldReorder={onFieldReorder}
                    />
                  ))}
                </SortableContext>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 md:py-12"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No fields yet</h3>
                  <p className="text-slate-400 mb-4">
                    Drag fields from the library to start building your form
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            </SortableContext>
            <div className={`h-10 rounded ${isOver ? 'bg-blue-500/10' : 'bg-transparent'}`} />

            {fields.length > 0 && (
              <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                Submit Form
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
