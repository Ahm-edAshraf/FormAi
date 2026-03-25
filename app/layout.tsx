import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { SiteFooter } from '@/components/site-footer'
import { isClerkConfigured } from '@/lib/clerk'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FormAI - AI-Powered Form Builder',
  description: 'Create beautiful forms instantly with AI. No coding required.',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const content = (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <Toaster />
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 min-w-0">
          {children}
        </div>
        <SiteFooter />
      </div>
    </ThemeProvider>
  )

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {isClerkConfigured() ? <ClerkProvider>{content}</ClerkProvider> : content}
      </body>
    </html>
  )
}
