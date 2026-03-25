import { ClerkNotConfigured } from '@/components/clerk-not-configured'
import { AccountSettings } from '@/components/account-settings'
import { isClerkConfigured } from '@/lib/clerk'

export default function SettingsPage() {
  if (!isClerkConfigured()) {
    return <ClerkNotConfigured title="Settings auth is not configured yet" />
  }

  return <AccountSettings />
}
