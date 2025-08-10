import { FormEditor } from '@/components/form-editor'

export default function EditorPage({ params }: { params: { id: string } }) {
  return <FormEditor formId={params.id} />
}
