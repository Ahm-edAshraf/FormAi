import { ClerkNotConfigured } from '@/components/clerk-not-configured'
import { FormEditor } from '@/components/form-editor'
import { isClerkConfigured } from '@/lib/clerk'

export default function EditorPage({ params }: { params: { id: string } }) {
  if (!isClerkConfigured()) {
    return <ClerkNotConfigured title="Editor auth is not configured yet" />
  }

  return <FormEditor formId={params.id} />
}
