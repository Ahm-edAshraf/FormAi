import { createClient as createSupabaseBrowser } from '@/utils/supabase/client'

export type SubmissionRow = {
  id: string
  created_at: string
  data: Record<string, any>
}

export async function fetchSubmissions(formId: string) {
  const supabase = createSupabaseBrowser()
  const { data, error } = await supabase
    .from('submissions')
    .select('id, created_at, data')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as SubmissionRow[]
}

export async function deleteSubmission(submissionId: string) {
  const supabase = createSupabaseBrowser()
  const { error } = await supabase.from('submissions').delete().eq('id', submissionId)
  if (error) throw error
}

export async function deleteForm(formId: string) {
  const supabase = createSupabaseBrowser()
  const { error } = await supabase.from('forms').delete().eq('id', formId)
  if (error) throw error
}


