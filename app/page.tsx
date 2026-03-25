import { LandingPage } from '@/components/landing-page'
import { redirectIfSignedIn } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Home() {
  await redirectIfSignedIn('/dashboard')
  return <LandingPage />
}
