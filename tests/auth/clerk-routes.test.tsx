import { beforeEach, describe, expect, it, vi } from 'vitest'

const redirect = vi.fn()
let authState: { userId: string | null } = { userId: null }

vi.mock('next/navigation', () => ({
  redirect,
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: async () => authState,
}))

vi.mock('@/components/landing-page', () => ({
  LandingPage: () => <div>Landing Page</div>,
}))

vi.mock('@/components/dashboard', () => ({
  Dashboard: () => <div>Dashboard</div>,
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: () => {
    throw new Error('Supabase auth path should not be used during Clerk migration')
  },
}))

describe('Clerk route auth', () => {
  beforeEach(() => {
    redirect.mockReset()
    authState = { userId: null }
  })

  it('redirects signed-in users from home using Clerk auth', async () => {
    authState = { userId: 'user_123' }
    const mod = await import('../../app/page')

    await mod.default()

    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects signed-out users from dashboard to sign-in using Clerk auth', async () => {
    const mod = await import('../../app/dashboard/page')

    await mod.default()

    expect(redirect).toHaveBeenCalledWith('/sign-in')
  })

  it('exposes dedicated sign-in and sign-up route modules', async () => {
    const signInPage = await import('../../app/sign-in/[[...sign-in]]/page')
    const signUpPage = await import('../../app/sign-up/[[...sign-up]]/page')

    expect(typeof signInPage.default).toBe('function')
    expect(typeof signUpPage.default).toBe('function')
  })
})
