import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export async function GET(
  request: Request,
  { params }: { params: { storageId: string } }
) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = await getToken({ template: 'convex' }).catch(async () => await getToken())

    const url = await fetchQuery(api.files.getFileUrlForOwner, {
      storageId: params.storageId as Id<'_storage'>,
    }, { token: token ?? undefined })

    if (!url) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.redirect(url)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to load file' }, { status: 500 })
  }
}
