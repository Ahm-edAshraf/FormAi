import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Using native inputs for better browser keyboard support on public pages
import { Label } from '@/components/ui/label'
import { RatingField } from '@/components/public/rating-field'
import { ViewBeacon } from '@/components/public/view-beacon'
import { Toaster } from '@/components/ui/toaster'
import { MobileNav } from '@/components/mobile-nav'
import ToastEffect from './ToastEffect'

export const dynamic = 'force-dynamic'

export default async function PublicFormPage({ params }: { params: { slug: string } }) {
  const formData = await fetchQuery(api.forms.getPublishedBySlug, { slug: params.slug })
  if (!formData) return <div className="container mx-auto p-6 text-white">Form not found</div>

  // View tracking handled client-side to persist cookie token reliably

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-4 md:p-6 max-w-2xl">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{formData.form.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ToastEffect />
            <ViewBeacon formId={formData.form._id} />
            <form action={`/api/forms/${formData.form._id}/submit?slug=${formData.form.slug ?? ''}`} method="post" encType="multipart/form-data" className="space-y-6">
              {formData.fields?.map((field) => (
                <div key={field._id} className="space-y-2">
                  <Label className="text-white">{field.label}{field.required && <span className="text-red-400">*</span>}</Label>
                  {field.type === 'text' && (
                    <input name={field._id} className="w-full h-10 rounded-md px-3 bg-slate-800 border border-slate-600 text-white" placeholder={field.placeholder || ''} required={field.required} />
                  )}
                  {field.type === 'email' && (
                    <input type="email" name={field._id} className="w-full h-10 rounded-md px-3 bg-slate-800 border border-slate-600 text-white" placeholder={field.placeholder || ''} required={field.required} />
                  )}
                  {field.type === 'url' && (
                    <input type="url" name={field._id} className="w-full h-10 rounded-md px-3 bg-slate-800 border border-slate-600 text-white" placeholder={field.placeholder || ''} required={field.required} />
                  )}
                  {field.type === 'phone' && (
                    <input type="tel" name={field._id} className="w-full h-10 rounded-md px-3 bg-slate-800 border border-slate-600 text-white" placeholder={field.placeholder || ''} required={field.required} />
                  )}
                  {field.type === 'textarea' && (
                    <textarea name={field._id} className="w-full min-h-24 rounded-md p-3 bg-slate-800 border border-slate-600 text-white" placeholder={field.placeholder || ''} required={field.required} />
                  )}
                  {field.type === 'number' && (
                    <input type="number" name={field._id} className="w-full h-10 rounded-md px-3 bg-slate-800 border border-slate-600 text-white" placeholder={field.placeholder || ''} required={field.required} />
                  )}
                  {field.type === 'date' && (
                    <input type="date" name={field._id} className="w-full h-10 rounded-md px-3 bg-slate-800 border border-slate-600 text-white" required={field.required} />
                  )}
                  {field.type === 'time' && (
                    <input type="time" name={field._id} className="w-full h-10 rounded-md px-3 bg-slate-800 border border-slate-600 text-white" required={field.required} />
                  )}
                  {field.type === 'select' && Array.isArray(field.options) && (
                    <select name={field._id} defaultValue="" className="w-full h-10 rounded-md px-3 bg-slate-800 border border-slate-600 text-white" required={field.required}>
                      <option value="" disabled hidden>Select an option</option>
                      {field.options.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {field.type === 'radio' && Array.isArray(field.options) && (
                    <div className="space-y-2">
                      {field.options.map((opt: string) => (
                        <label key={opt} className="flex items-center gap-2 text-slate-300">
                          <input type="radio" name={field._id} value={opt} required={field.required} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {field.type === 'checkbox' && Array.isArray(field.options) && (
                    <div className="space-y-2">
                      {field.options.map((opt: string) => (
                        <label key={opt} className="flex items-center gap-2 text-slate-300">
                          <input type="checkbox" name={field._id} value={opt} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {field.type === 'rating' && (
                    <RatingField name={field._id} required={field.required} />
                  )}
                  {field.type === 'address' && (
                    <textarea name={field._id} className="w-full min-h-24 rounded-md p-3 bg-slate-800 border border-slate-600 text-white" placeholder={field.placeholder || ''} required={field.required} />
                  )}
                  {field.type === 'file' && (
                    <input type="file" name={field._id} className="w-full text-slate-300" />
                  )}
                </div>
              ))}
              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-blue-600">Submit</Button>
            </form>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    </div>
  )
}
