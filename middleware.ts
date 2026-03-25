import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isClerkConfigured } from '@/lib/clerk'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/editor(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/submissions(.*)',
  '/analytics(.*)',
])

const clerkEnabled = isClerkConfigured()

export default clerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect()
      }
    })
  : () => NextResponse.next()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
