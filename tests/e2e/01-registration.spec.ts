import { test, expect } from '@playwright/test'

/**
 * Critical User Journey #1: User Registration
 * Tests the complete registration flow with invitation code
 *
 * Current app state:
 * - Registration requires invitation code
 * - Password minimum 6 characters
 * - Form uses id selectors (#name, #email, etc.)
 */
test.describe('User Registration', () => {
  // Use a valid invitation code from environment or default test code
  const INVITATION_CODE = process.env.INVITATION_CODE || 'GASTRO2025'

  test('should display registration form with all required fields', async ({ page }) => {
    await page.goto('/register')

    // Verify page loaded correctly
    await expect(page.locator('h1')).toContainText('Account erstellen')

    // Verify all form fields are present
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#invitationCode')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirmPassword')).toBeVisible()

    // Verify submit button
    await expect(page.locator('button[type="submit"]')).toContainText('Account erstellen')
  })

  test('should show validation for empty form submission', async ({ page }) => {
    await page.goto('/register')

    // Submit button should be disabled when fields are empty
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeDisabled()
  })

  test('should validate password confirmation mismatch', async ({ page }) => {
    await page.goto('/register')

    // Fill form with mismatched passwords
    await page.fill('#name', 'Test User')
    await page.fill('#email', 'test@example.com')
    await page.fill('#invitationCode', INVITATION_CODE)
    await page.fill('#password', 'TestPass123')
    await page.fill('#confirmPassword', 'DifferentPass')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show password mismatch error
    await expect(page.locator('.error')).toContainText('Passwörter stimmen nicht überein')
  })

  test('should reject invalid invitation code', async ({ page }) => {
    await page.goto('/register')

    const testEmail = `test-${Date.now()}@example.com`

    // Fill form with invalid invitation code
    await page.fill('#name', 'Test User')
    await page.fill('#email', testEmail)
    await page.fill('#invitationCode', 'WRONGCODE')
    await page.fill('#password', 'TestPass123')
    await page.fill('#confirmPassword', 'TestPass123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show invitation code error
    await expect(page.locator('.error')).toContainText(/Einladungscode|Ungültig/i, { timeout: 10000 })
  })

  test('should have working login link', async ({ page }) => {
    await page.goto('/register')

    // Should have link to login page (use first() since there may be multiple)
    const loginLink = page.locator('a[href="/login"]').first()
    await expect(loginLink).toBeVisible()

    // Click should navigate to login
    await loginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show password requirements hint', async ({ page }) => {
    await page.goto('/register')

    // Should show minimum character hint
    await expect(page.locator('text=Mindestens 6 Zeichen')).toBeVisible()
  })

  test('should show invitation code hint', async ({ page }) => {
    await page.goto('/register')

    // Should show hint about WhatsApp group
    await expect(page.locator('text=WhatsApp-Gruppe')).toBeVisible()
  })
})
