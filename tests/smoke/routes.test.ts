import { describe, expect, it, vi } from 'vitest'

let mockUser: { id: string } | null = null
let mockPublicForm: Record<string, unknown> | null = null
let authState: { userId: string | null } = { userId: null }
const redirect = vi.fn()

function createQueryResult() {
  return {
    eq() {
      return this
    },
    in: async () => ({ count: 0 }),
    order: () => ({ data: [], single: async () => ({ data: mockPublicForm }) }),
    single: async () => ({ data: mockPublicForm }),
    then(resolve: (value: { data: [] }) => unknown) {
      return Promise.resolve({ data: [] }).then(resolve)
    },
  }
}

vi.mock('next/headers', () => ({
  cookies: () => ({ getAll: () => [], get: () => undefined, set: () => undefined }),
}))

vi.mock('next/navigation', () => ({
  redirect,
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: async () => authState,
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: mockUser } }),
    },
    from: () => ({
      select: () => createQueryResult(),
      rpc: async () => ({ data: [] }),
    }),
  }),
}))

vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => ({
    from: () => ({
      select: () => createQueryResult(),
    }),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: unknown; href: string }) => ({ type: 'a', props: { href, children } }),
}))

vi.mock('lucide-react', () => {
  const Icon = () => ({ type: 'svg', props: {} })
  return {
    ArrowLeft: Icon,
    BarChart3: Icon,
    Download: Icon,
    Eye: Icon,
    FileDown: Icon,
    Sparkles: Icon,
    Users: Icon,
    Zap: Icon,
  }
})

vi.mock('@/components/landing-page', () => ({
  LandingPage: () => ({ type: 'div', props: { children: 'Landing Page' } }),
}))

vi.mock('@/components/dashboard', () => ({
  Dashboard: (props: unknown) => ({ type: 'div', props: { children: 'Dashboard', ...((props as object) || {}) } }),
}))

vi.mock('@/components/form-editor', () => ({
  FormEditor: ({ formId }: { formId: string }) => ({ type: 'div', props: { formId } }),
}))

vi.mock('@/components/billing-portal', () => ({
  BillingPortal: () => ({ type: 'div', props: { children: 'Billing Portal' } }),
}))

vi.mock('@/components/account-settings', () => ({
  AccountSettings: () => ({ type: 'div', props: { children: 'Account Settings' } }),
}))

vi.mock('@/components/submissions-manager', () => ({
  SubmissionsManager: ({ formId }: { formId: string }) => ({ type: 'div', props: { formId } }),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: unknown }) => ({ type: 'div', props: { children } }),
  CardContent: ({ children }: { children: unknown }) => ({ type: 'div', props: { children } }),
  CardHeader: ({ children }: { children: unknown }) => ({ type: 'div', props: { children } }),
  CardTitle: ({ children }: { children: unknown }) => ({ type: 'div', props: { children } }),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: unknown }) => ({ type: 'button', props: { children } }),
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: unknown }) => ({ type: 'label', props: { children } }),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: unknown }) => ({ type: 'span', props: { children } }),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ children }: { children?: unknown }) => ({ type: 'input', props: { children } }),
}))

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => ({ type: 'div', props: { children: 'Toaster' } }),
}))

vi.mock('@/components/public/rating-field', () => ({
  RatingField: () => ({ type: 'div', props: { children: 'Rating Field' } }),
}))

vi.mock('@/components/public/view-beacon', () => ({
  ViewBeacon: () => ({ type: 'div', props: { children: 'View Beacon' } }),
}))

vi.mock('@/components/mobile-nav', () => ({
  MobileNav: () => ({ type: 'div', props: { children: 'Mobile Nav' } }),
}))

vi.mock('../../app/f/[slug]/ToastEffect', () => ({
  default: () => ({ type: 'div', props: { children: 'Toast Effect' } }),
}))

describe('route smoke coverage', () => {
  it('executes the home page route without redirecting signed-out users', async () => {
    mockUser = null
    authState = { userId: null }
    redirect.mockClear()

    const mod = await import('../../app/page')
    const result = await mod.default()

    expect(redirect).not.toHaveBeenCalled()
    expect(result).toBeTruthy()
  })

  it('executes the dashboard route for signed-out users', async () => {
    mockUser = null
    authState = { userId: null }
    redirect.mockClear()

    const mod = await import('../../app/dashboard/page')
    const result = await mod.default()

    expect(redirect).toHaveBeenCalledWith('/sign-in')
    expect(result).toBeTruthy()
  })

  it('maps editor params to the form editor', async () => {
    const mod = await import('../../app/editor/[id]/page')
    const result = mod.default({ params: { id: 'form_123' } }) as { props?: { formId?: string } }

    expect(result.props?.formId).toBe('form_123')
  })

  it('returns the not-found fallback for a missing public form', async () => {
    mockPublicForm = null

    const mod = await import('../../app/f/[slug]/page')
    const result = await mod.default({ params: { slug: 'missing-form' } }) as { props?: { children?: string } }

    expect(result.props?.children).toBe('Form not found')
  })

  it('executes the analytics page route', async () => {
    mockUser = null

    const mod = await import('../../app/analytics/page')
    const result = await mod.default()

    expect(result).toBeTruthy()
  })

  it('executes the billing page route', async () => {
    const mod = await import('../../app/billing/page')
    const result = mod.default()

    expect(result).toBeTruthy()
  })

  it('executes the settings page route', async () => {
    const mod = await import('../../app/settings/page')
    const result = mod.default()

    expect(result).toBeTruthy()
  })

  it('maps submission params to the submissions manager', async () => {
    const mod = await import('../../app/submissions/[id]/page')
    const result = mod.default({ params: { id: 'form_123' } }) as { props?: { formId?: string } }

    expect(result.props?.formId).toBe('form_123')
  })
})
