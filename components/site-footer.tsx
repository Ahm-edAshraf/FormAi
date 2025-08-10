'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-slate-800/60 bg-slate-900/30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40">
      <div className="container mx-auto px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-2">
            <span className="inline-flex w-5 h-5 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
            <span className="text-white font-medium">FormAI</span>
          </span>
          <span>© {year}</span>
          <span className="mx-2 text-slate-600">•</span>
          <span>made by Ahmed Ashraf ❤️</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  )
}


