import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchQuery = vi.fn()
let authState = { userId: null as string | null, getToken: vi.fn(async () => null as string | null) }

vi.mock('convex/nextjs', () => ({
  fetchQuery,
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: async () => authState,
}))

describe('file access route', () => {
  beforeEach(() => {
    fetchQuery.mockReset()
    authState = { userId: null, getToken: vi.fn(async () => null as string | null) }
  })

  it('rejects unauthenticated access to uploaded files', async () => {
    const { GET } = await import('../../app/api/files/[storageId]/route')
    const response = await GET(new Request('http://localhost/api/files/storage123'), {
      params: { storageId: 'storage123' },
    })

    expect(response.status).toBe(401)
    expect(fetchQuery).not.toHaveBeenCalled()
  })

  it('redirects owners to the resolved file URL', async () => {
    authState = { userId: 'clerk|ahmed', getToken: vi.fn(async () => 'token-123') }
    fetchQuery.mockResolvedValueOnce('https://files.example.test/download')

    const { GET } = await import('../../app/api/files/[storageId]/route')
    const response = await GET(new Request('http://localhost/api/files/storage123'), {
      params: { storageId: 'storage123' },
    })

    expect(response.status).toBe(307)
    expect(fetchQuery).toHaveBeenCalledTimes(1)
    expect(fetchQuery.mock.calls[0]?.[2]).toEqual({ token: 'token-123' })
    expect(response.headers.get('location')).toBe('https://files.example.test/download')
  })
})
