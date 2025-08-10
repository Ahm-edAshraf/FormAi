import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { SubmissionsManager } from '@/components/submissions-manager'
import { unstable_cache } from 'next/cache'

export default function SubmissionsPage({ params }: { params: { id: string } }) {
  return <SubmissionsManager formId={params.id} />
}
