import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { isClerkConfigured } from '@/lib/clerk'
import { getInternalServerSecret } from '@/lib/server-secret'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const uploadedStorageIds: Id<'_storage'>[] = []
  try {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug') ?? ''
    const cookieStore = cookies()
    const authState = isClerkConfigured() ? await auth() : { userId: null }
    const userId = authState.userId
    const formId = params.id as Id<'forms'>

    const body = await request.formData()
    const entries: Record<string, any> = {}
    const fileUploads: Array<{ fieldId: string; file: File }> = []
    for (const [key, value] of body.entries()) {
      if (value instanceof File) {
        if (value.size > 0) fileUploads.push({ fieldId: key, file: value })
        continue
      }
      if (entries[key]) {
        entries[key] = Array.isArray(entries[key]) ? [...entries[key], value] : [entries[key], value]
      } else {
        entries[key] = value
      }
    }

    // Upload files to storage and store URLs
    if (fileUploads.length > 0) {
      for (const { fieldId, file } of fileUploads) {
        const uploadUrl = await fetchMutation(api.files.generateUploadUrl, {
          formId,
          serverSecret: getInternalServerSecret(),
        })
        const uploadRes = await fetch(uploadUrl, { method: 'POST', body: file })
        if (!uploadRes.ok) throw new Error('Failed to upload file')
        const { storageId } = await uploadRes.json()
        uploadedStorageIds.push(storageId)
        entries[fieldId] = {
          storageId,
          name: file.name,
          type: file.type,
          size: file.size,
        }
      }
    }

    // Identify anonymous visitors via a cookie token
    const cookieName = `v_${formId}`
    let visitor = cookieStore.get(cookieName)?.value
    if (!visitor) {
      visitor = crypto.randomUUID()
    }
    const form = await fetchQuery(api.forms.getPublishedById, { formId })
    if (!form) {
      return NextResponse.redirect(new URL(`/f/${slug}?error=failed`, request.url), { status: 303 })
    }

    await fetchMutation(api.submissions.submitPublic, {
      formId,
      answers: entries,
      visitorToken: visitor,
      submitterUserId: userId ?? undefined,
      serverSecret: getInternalServerSecret(),
    })

    const res = NextResponse.redirect(new URL(`/f/${slug}?submitted=1`, request.url), { status: 303 })
    // Persist visitor token for future submissions
    res.cookies.set(cookieName, visitor, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch (err: any) {
    if (uploadedStorageIds.length > 0) {
      await fetchMutation(api.files.deleteFiles, {
        storageIds: uploadedStorageIds,
        serverSecret: getInternalServerSecret(),
      }).catch(() => {})
    }
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug') ?? ''
    const code = err?.message === 'Already submitted' ? 'already_submitted' : 'failed'
    return NextResponse.redirect(new URL(`/f/${slug}?error=${code}`, request.url), { status: 303 })
  }
}
