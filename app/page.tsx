import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing-page'
import { createClient as createSupabaseServer } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createSupabaseServer(cookieStore)
  const { data: userData } = await supabase.auth.getUser()
  if (userData?.user) {
    redirect('/dashboard')
  }
  return <LandingPage />
}
