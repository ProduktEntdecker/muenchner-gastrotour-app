import { test, expect } from '@playwright/test'

/**
 * Critical User Journey #2: User Login
 * Prevents production incidents with user authentication
 */
test.describe('User Login', () => {
  test('should allow user to login with magic link', async ({ page }) => {
    await page.goto('/login')
    
    // Verify login page loaded correctly
    await expect(page).toHaveTitle(/Anmeld|Login/)
    await expect(page.locator('h1')).toContainText(/Anmeldung|Login/)
    
    // Fill email for magic link
    const testEmail = 'e2e-test@example.com'
    await page.fill('input[name="email"]', testEmail)
    
    // Submit magic link request
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=/E-Mail.*gesendet|magic.*link|sent/i')).toBeVisible({ timeout: 10000 })
  })
  
  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login')
    
    // Enter invalid email
    await page.fill('input[name="email"]', 'not-an-email')
    await page.click('button[type="submit"]')
    
    // Should show validation error (HTML5 or custom)
    const emailField = page.locator('input[name="email"]')
    const invalidMessage = await emailField.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(invalidMessage).toBeTruthy()
  })
  
  test('should have working registration link', async ({ page }) => {
    await page.goto('/login')
    
    // Should have link to registration page
    const registerLink = page.locator('a[href="/register"], a:has-text("registrieren")')
    await expect(registerLink).toBeVisible()
    
    // Click should navigate to registration
    await registerLink.click()
    await expect(page).toHaveURL(/\/register/)
  })
  
  test('should handle non-existent user gracefully', async ({ page }) => {
    await page.goto('/login')
    
    // Try to login with non-existent email
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.click('button[type="submit"]')
    
    // Should still show success message (security best practice)
    // or show appropriate error message
    await expect(page.locator('text=/E-Mail.*gesendet|link.*sent|Benutzer.*nicht|user.*not/i')).toBeVisible({ timeout: 10000 })
  })
  
  test('should prevent multiple rapid submissions', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'test@example.com')
    
    // Click submit button multiple times rapidly
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    await submitButton.click() // Second click should be ignored
    
    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled({ timeout: 5000 })
  })
  
  test('should show loading state during submission', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'test@example.com')
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Should show loading text or spinner
    await expect(page.locator('text=/wird.*gesendet|sending|loading/i')).toBeVisible({ timeout: 5000 })
  })
})