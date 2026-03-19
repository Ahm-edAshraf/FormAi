import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'bunx next dev --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000/privacy',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
