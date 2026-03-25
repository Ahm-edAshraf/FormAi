import Link from 'next/link'

export function ClerkNotConfigured({ title = 'Clerk is not configured yet' }: { title?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md rounded-2xl border border-slate-700 bg-slate-900/80 p-8 text-center text-slate-300">
        <h1 className="text-2xl font-semibold text-white mb-4">{title}</h1>
        <p className="mb-6">Add your Clerk publishable and secret keys to enable authenticated routes.</p>
        <Link href="/" className="text-blue-300 hover:text-blue-200">Back to home</Link>
      </div>
    </div>
  )
}
