import { z } from 'zod'

export const FieldTypeEnum = z.enum([
  'text',
  'textarea',
  'email',
  'number',
  'phone',
  'url',
  'select',
  'radio',
  'checkbox',
  'date',
  'time',
  'rating',
  'address',
  'file',
  'color',
])

export const FieldSpecSchema = z.object({
  id: z.string().uuid().optional(),
  type: FieldTypeEnum,
  label: z.string().min(1),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: z.record(z.any()).optional(),
  position: z.number().int().nonnegative().optional(),
})

export const FormSpecSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(FieldSpecSchema).default([]),
})

export type FieldSpec = z.infer<typeof FieldSpecSchema>
export type FormSpec = z.infer<typeof FormSpecSchema>


