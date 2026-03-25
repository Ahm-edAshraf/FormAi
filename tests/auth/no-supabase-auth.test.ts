import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

const files = [
  'app/api/analytics/export/route.ts',
  'app/api/forms/[id]/publish/route.ts',
  'app/api/forms/[id]/submit/route.ts',
  'app/api/forms/[id]/view/route.ts',
]

describe('Supabase auth cleanup', () => {
  it('removes remaining supabase.auth.getUser calls from route handlers', () => {
    for (const file of files) {
      const content = readFileSync(path.join(root, file), 'utf8')

      expect(content).not.toContain('supabase.auth.getUser(')
    }
  })
})
