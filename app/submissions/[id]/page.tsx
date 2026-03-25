import { ClerkNotConfigured } from '@/components/clerk-not-configured'
import { cookies } from 'next/headers'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'
import { SubmissionsManager } from '@/components/submissions-manager'
import { unstable_cache } from 'next/cache'
import { isClerkConfigured } from '@/lib/clerk'

export default function SubmissionsPage({ params }: { params: { id: string } }) {
  if (!isClerkConfigured()) {
    return <ClerkNotConfigured title="Submissions auth is not configured yet" />
  }

  return <SubmissionsManager formId={params.id} />
}
