import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Protected upload route', () => {
  it('requires Clerk auth and form ownership before uploading', () => {
    const content = readFileSync(path.join(process.cwd(), 'app/api/forms/[id]/upload/route.ts'), 'utf8')

    expect(content).toContain("from '@clerk/nextjs/server'")
    expect(content).toContain('await auth()')
    expect(content).toContain("return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })")
    expect(content).toContain("return NextResponse.json({ error: 'Forbidden' }, { status: 403 })")
  })
})
