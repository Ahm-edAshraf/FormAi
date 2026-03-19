import { describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

describe('bun migration', () => {
  test('uses a Bun lockfile instead of a pnpm lockfile', () => {
    expect(existsSync(path.join(root, 'bun.lock'))).toBe(true)
    expect(existsSync(path.join(root, 'pnpm-lock.yaml'))).toBe(false)
  })

  test('documents Bun commands instead of pnpm commands', () => {
    const readme = read('README.md')

    expect(readme.includes('bun install')).toBe(true)
    expect(readme.includes('bun dev')).toBe(true)
    expect(readme.includes('bun run build')).toBe(true)
    expect(readme.includes('bun run start')).toBe(true)
    expect(readme.includes('bun run lint')).toBe(true)
    expect(readme.includes('Bun 1.3.9')).toBe(true)
  })

  test('keeps core scripts available from package.json', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts?: Record<string, string> }

    expect(pkg.scripts?.dev).toBeDefined()
    expect(pkg.scripts?.build).toBeDefined()
    expect(pkg.scripts?.start).toBeDefined()
    expect(pkg.scripts?.lint).toBeDefined()
    expect(pkg.scripts?.lighthouse?.startsWith('bun ')).toBe(true)
  })

  test('uses Bun tooling inside the lighthouse helper', () => {
    const lighthouseScript = read('scripts/run-lighthouse.cjs')

    expect(lighthouseScript.includes("run('bunx'")).toBe(true)
    expect(lighthouseScript.includes("run('npx'")).toBe(false)
  })

  test('ignores generated Lighthouse artifacts', () => {
    const gitignore = read('.gitignore')

    expect(gitignore.includes('.lighthouse/')).toBe(true)
  })
})
