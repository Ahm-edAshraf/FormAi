import { Dashboard } from '@/components/dashboard'
import { ClerkNotConfigured } from '@/components/clerk-not-configured'
import { requireUserId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const userId = await requireUserId()

  if (!userId) {
    return <ClerkNotConfigured title="Dashboard auth is not configured yet" />
  }

  return <Dashboard />
}
