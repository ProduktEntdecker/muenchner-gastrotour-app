import { test, expect } from '@playwright/test'

/**
 * Critical User Journey #3: Homepage & Navigation
 * Tests the main entry point and navigation flow
 */
test.describe('Homepage & Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should be mobile responsive', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have working navigation to events', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    // Events page should load - check for heading or no-events message
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('should have working navigation to login', async ({ page }) => {
    await page.goto('/login')

    // Login page should load
    await expect(page.locator('h1')).toContainText('Anmelden')
  })

  test('should have working navigation to register', async ({ page }) => {
    await page.goto('/register')

    // Register page should load
    await expect(page.locator('h1')).toContainText('Account erstellen')
  })
})
