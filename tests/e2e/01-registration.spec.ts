import { test, expect } from '@playwright/test'

/**
 * Critical User Journey #1: User Registration
 * Prevents production incidents with user onboarding
 */
test.describe('User Registration', () => {
  test('should allow new user to register successfully', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')
    
    // Verify page loaded correctly
    await expect(page).toHaveTitle(/Account erstellen|Registr/)
    await expect(page.locator('h1')).toContainText('Account erstellen')
    
    // Fill out registration form
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message or redirect
    await expect(page.locator('.success, [data-testid="success"]')).toBeVisible({ timeout: 10000 })
    
    // Should contain confirmation message
    await expect(page.locator('text=/E-Mail|bestätigt|erfolgreich/i')).toBeVisible()
  })
  
  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register')
    
    // Try to submit with empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors (HTML5 or custom)
    const nameField = page.locator('input[name="name"]')
    const emailField = page.locator('input[name="email"]')
    const passwordField = page.locator('input[name="password"]')
    
    // Check HTML5 validation or custom error messages
    await expect(nameField).toBeRequired()
    await expect(emailField).toBeRequired()  
    await expect(passwordField).toBeRequired()
  })
  
  test('should reject duplicate email registration', async ({ page }) => {
    // First, register a user
    await page.goto('/register')
    
    const testEmail = 'duplicate-test@example.com'
    const testPassword = 'TestPassword123!'
    
    await page.fill('input[name="name"]', 'First User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    
    await page.click('button[type="submit"]')

    // Wait for first registration to complete by checking for success indicator
    await page.waitForSelector('.success, [data-testid="success"], text=/E-Mail|bestätigt|erfolgreich/i', {
      timeout: 10000,
      state: 'visible'
    })

    // Try to register again with same email
    await page.goto('/register')
    
    await page.fill('input[name="name"]', 'Second User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    
    await page.click('button[type="submit"]')
    
    // Should show error message about duplicate email
    await expect(page.locator('.error, [data-testid="error"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=/bereits|registriert|exists/i')).toBeVisible()
  })
  
  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword!')
    
    await page.click('button[type="submit"]')
    
    // Should show password mismatch error
    await expect(page.locator('text=/Passwörter.*nicht.*überein|passwords.*match/i')).toBeVisible()
  })
  
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/register')
    
    // Should have link to login page
    const loginLink = page.locator('a[href="/login"], a:has-text("Anmeldung")')
    await expect(loginLink).toBeVisible()
    
    // Click should navigate to login
    await loginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })
})