import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/editor/:path*',
    '/settings/:path*',
    '/billing/:path*',
    '/submissions/:path*',
    '/analytics/:path*',
  ],
}


