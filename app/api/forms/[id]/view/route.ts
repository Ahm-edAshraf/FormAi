import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { isClerkConfigured } from '@/lib/clerk'
import { getInternalServerSecret } from '@/lib/server-secret'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const authState = isClerkConfigured() ? await auth() : { userId: null }
    const cookieName = `v_${params.id}`
    let visitor = cookieStore.get(cookieName)?.value
    if (!visitor) visitor = crypto.randomUUID()

    await fetchMutation(api.submissions.trackView, {
      formId: params.id as Id<'forms'>,
      visitorToken: visitor,
      submitterUserId: authState.userId ?? undefined,
      serverSecret: getInternalServerSecret(),
    })

    const res = NextResponse.json({ ok: true })
    // Persist visitor token for one year
    res.cookies.set(cookieName, visitor, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

export const runtime = 'edge'
export const preferredRegion = 'auto'
