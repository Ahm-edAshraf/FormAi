/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/dynamic', () => ({
  default: () => () => null,
}))

vi.mock('framer-motion', () => {
  const createPrimitive = (tag: string) => ({ children, animate, initial, transition, whileHover, whileInView, viewport, whileTap, ...props }: any) => {
    const Component = tag as keyof JSX.IntrinsicElements
    return <Component {...props}>{children}</Component>
  }

  return {
    motion: new Proxy({}, { get: (_target, key) => createPrimitive(String(key)) }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

describe('Landing page auth actions', () => {
  it('shows visible links to the Clerk sign-in and sign-up routes', async () => {
    const { LandingPage } = await import('../../components/landing-page')

    render(<LandingPage />)

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/sign-in')
    expect(screen.getAllByRole('link', { name: /get started/i })[0]).toHaveAttribute('href', '/sign-up')
  })
})
