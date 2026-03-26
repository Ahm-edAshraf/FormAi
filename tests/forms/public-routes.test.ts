import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMutation = vi.fn()
const cookieStore = {
  get: vi.fn(),
  getAll: vi.fn(() => []),
  set: vi.fn(),
}

vi.mock('convex/nextjs', () => ({
  fetchMutation,
  fetchQuery: vi.fn(async () => ({ userId: 'clerk|owner' })),
}))

vi.mock('next/headers', () => ({
  cookies: () => cookieStore,
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: async () => ({ userId: null }),
}))

vi.mock('@/lib/clerk', () => ({
  isClerkConfigured: () => false,
}))

describe('public form routes', () => {
  beforeEach(() => {
    fetchMutation.mockReset()
    cookieStore.get.mockReset()
    cookieStore.getAll.mockReset()
    cookieStore.set.mockReset()
    cookieStore.get.mockReturnValue(undefined)
    vi.stubGlobal('fetch', vi.fn())
  })

  it('uploads files through Convex storage before submitting', async () => {
    fetchMutation
      .mockResolvedValueOnce('https://upload.example.test')
      .mockResolvedValueOnce('submission-id')
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ storageId: 'storage_123' }), { status: 200 }))

    const formData = new FormData()
    formData.set('field_text', 'hello')
    formData.set('field_file', new File(['demo'], 'demo.txt', { type: 'text/plain' }))

    const { POST } = await import('../../app/api/forms/[id]/submit/route')
    const response = await POST(new Request('http://localhost/api/forms/form123/submit?slug=public-form', { method: 'POST', body: formData }), {
      params: { id: 'form123' },
    })

    expect(fetchMutation).toHaveBeenCalledTimes(2)
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe('https://upload.example.test')
    expect(fetchMutation.mock.calls[1]?.[1]).toMatchObject({
      answers: {
        field_text: 'hello',
        field_file: {
          storageId: 'storage_123',
          name: 'demo.txt',
          type: 'text/plain',
        },
      },
    })
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toContain('/f/public-form?submitted=1')
  })

  it('tracks public views through Convex and persists a visitor cookie', async () => {
    fetchMutation.mockResolvedValueOnce('view-id')

    const { POST } = await import('../../app/api/forms/[id]/view/route')
    const response = await POST(new Request('http://localhost/api/forms/form123/view', { method: 'POST' }), {
      params: { id: 'form123' },
    })

    expect(fetchMutation).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toContain('v_form123=')
  })

  it('passes the server secret into submit and view mutations', async () => {
    const submitRoute = await import('../../app/api/forms/[id]/submit/route')
    const viewRoute = await import('../../app/api/forms/[id]/view/route')

    expect(String(submitRoute.POST)).toContain('serverSecret: (0,__vite_ssr_import_')
    expect(String(viewRoute.POST)).toContain('serverSecret: (0,__vite_ssr_import_')
  })
})
