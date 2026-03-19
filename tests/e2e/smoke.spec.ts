import { expect, test } from '@playwright/test'

test('renders the privacy policy page', async ({ page }) => {
  await page.goto('/privacy')

  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible()
})
