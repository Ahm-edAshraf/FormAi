import { ClerkNotConfigured } from '@/components/clerk-not-configured'
import { BillingPortal } from '@/components/billing-portal'
import { isClerkConfigured } from '@/lib/clerk'

export default function BillingPage() {
  if (!isClerkConfigured()) {
    return <ClerkNotConfigured title="Billing auth is not configured yet" />
  }

  return <BillingPortal />
}
