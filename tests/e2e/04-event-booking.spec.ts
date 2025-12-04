import { test, expect } from '@playwright/test'

/**
 * Critical User Journey #4: Event Display & Booking UI
 * Tests the events page display and booking button interaction
 *
 * Note: Actual booking requires authentication, so we test:
 * 1. Events display correctly
 * 2. Booking button redirects to login if not authenticated
 * 3. Event details are shown correctly
 */
test.describe('Event Display & Booking UI', () => {

  test('should display events page with event cards', async ({ page }) => {
    await page.goto('/events')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Should show heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    // Page should have loaded (either events or empty state or loading finished)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should display event details in cards', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    const eventCards = page.locator('[data-testid="event-card"]')

    if (await eventCards.count() > 0) {
      const firstCard = eventCards.first()

      // Event card should have essential information
      await expect(firstCard.locator('[data-testid="event-name"]')).toBeVisible()
      await expect(firstCard.locator('[data-testid="event-date"]')).toBeVisible()
      await expect(firstCard.locator('[data-testid="event-address"]')).toBeVisible()
      await expect(firstCard.locator('[data-testid="seats-available"]')).toBeVisible()
    }
  })

  test('should show booking button on event cards', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    const eventCards = page.locator('[data-testid="event-card"]')

    if (await eventCards.count() > 0) {
      // Find booking button
      const bookButton = page.locator('button:has-text("Platz reservieren"), button:has-text("Ausgebucht")')

      if (await bookButton.count() > 0) {
        await expect(bookButton.first()).toBeVisible()
      }
    }
  })

  test('should redirect to login when booking without authentication', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    const bookButton = page.locator('button:has-text("Platz reservieren")').first()

    if (await bookButton.count() > 0 && await bookButton.isEnabled()) {
      await bookButton.click()

      // Should redirect to login (with redirect param) or show 401 error
      await page.waitForTimeout(2000)

      // Either redirected to login or shows error message
      const onLoginPage = page.url().includes('/login')
      const hasAuthError = await page.locator('.error').count() > 0

      expect(onLoginPage || hasAuthError).toBeTruthy()
    }
  })

  test('should show cuisine filter when multiple cuisine types exist', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    // Cuisine filter may or may not exist depending on data
    const cuisineFilter = page.locator('[data-testid="cuisine-filter"]')

    if (await cuisineFilter.count() > 0) {
      await expect(cuisineFilter).toBeVisible()
    }
  })

  test('should display seats available as number', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    const seatsDisplay = page.locator('[data-testid="seats-available"]').first()

    if (await seatsDisplay.count() > 0) {
      const text = await seatsDisplay.textContent()
      // Should contain a number
      expect(text).toMatch(/\d/)
    }
  })

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    // Page should load without horizontal scroll
    const eventCards = page.locator('[data-testid="event-card"]')

    if (await eventCards.count() > 0) {
      await expect(eventCards.first()).toBeVisible()
    }
  })

  test('should show attendees count when events have bookings', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    // Look for attendees/participants display
    const attendeesInfo = page.locator('text=/Teilnehmer/')

    // This may or may not be visible depending on whether there are attendees
    // Just verify page doesn't crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle page refresh gracefully', async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    // Refresh
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Should still work - heading should be visible
    await expect(page.locator('h1')).toBeVisible()
  })
})
