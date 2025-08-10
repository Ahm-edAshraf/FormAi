'use client'

import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Type, Mail, Hash, Calendar, CheckSquare, List, FileText, Phone, Star, MapPin, Clock, Link, Image, Palette } from 'lucide-react'

const fieldTypes = [
  {
    category: 'Basic Fields',
    fields: [
      { type: 'text', label: 'Text Input', icon: Type, description: 'Single line text input' },
      { type: 'textarea', label: 'Text Area', icon: FileText, description: 'Multi-line text input' },
      { type: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
      { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
      { type: 'phone', label: 'Phone', icon: Phone, description: 'Phone number input' },
      { type: 'url', label: 'URL', icon: Link, description: 'Website URL input' }
    ]
  },
  {
    category: 'Selection Fields',
    fields: [
      { type: 'select', label: 'Dropdown', icon: List, description: 'Single selection dropdown' },
      { type: 'radio', label: 'Radio Buttons', icon: CheckSquare, description: 'Single choice selection' },
      { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Multiple choice selection' }
    ]
  },
  {
    category: 'Advanced Fields',
    fields: [
      { type: 'date', label: 'Date Picker', icon: Calendar, description: 'Date selection' },
      { type: 'time', label: 'Time Picker', icon: Clock, description: 'Time selection' },
      { type: 'rating', label: 'Star Rating', icon: Star, description: 'Star rating input' },
      { type: 'address', label: 'Address', icon: MapPin, description: 'Address input with autocomplete' },
      { type: 'file', label: 'File Upload', icon: Image, description: 'File upload field' },
      { type: 'color', label: 'Color Picker', icon: Palette, description: 'Color selection' }
    ]
  }
]

function DraggableField({ field }: { field: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-${field.type}`,
    data: field
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-blue-500/50 ${
        isDragging ? 'opacity-50' : 'hover:shadow-lg hover:shadow-blue-500/20'
      } bg-slate-800/50 border-slate-700`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <field.icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white mb-1">{field.label}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{field.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FieldLibrary() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Field Library</h2>
        <p className="text-sm text-slate-400">Drag fields to add them to your form</p>
      </div>

      {fieldTypes.map((category) => (
        <div key={category.category} className="space-y-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-300">{category.category}</h3>
            <Badge variant="secondary" className="text-xs">
              {category.fields.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {category.fields.map((field) => (
              <DraggableField key={field.type} field={field} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
