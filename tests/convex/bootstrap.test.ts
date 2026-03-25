import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('Convex bootstrap', () => {
  it('adds the core Convex scaffolding files', () => {
    expect(existsSync(path.join(root, 'components/convex-client-provider.tsx'))).toBe(true)
    expect(existsSync(path.join(root, 'lib/convex.ts'))).toBe(true)
    expect(existsSync(path.join(root, 'convex/schema.ts'))).toBe(true)
    expect(existsSync(path.join(root, 'convex/auth.config.ts'))).toBe(true)
  })

  it('wraps the app with the Convex client provider', () => {
    const layout = readFileSync(path.join(root, 'app/layout.tsx'), 'utf8')

    expect(layout).toContain("from '@/components/convex-client-provider'")
    expect(layout).toContain('<ConvexClientProvider>')
  })

  it('uses a public-only client env gate and documents Clerk for Convex auth', () => {
    const convexLib = readFileSync(path.join(root, 'lib/convex.ts'), 'utf8')
    const envExample = readFileSync(path.join(root, '.env.example'), 'utf8')

    expect(convexLib).toContain('isConvexClientConfigured')
    expect(convexLib).toContain('NEXT_PUBLIC_CONVEX_URL')
    expect(envExample).toContain('CLERK_FRONTEND_API_URL')
  })
})
