import { chromium, FullConfig } from '@playwright/test'

/**
 * Global setup for Playwright tests
 * Runs once before all tests to prepare test environment
 */
async function globalSetup(config: FullConfig) {
  console.log('[Playwright] Global setup started')

  // Get base URL from config
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3001'
  console.log(`[Playwright] Using base URL: ${baseURL}`)

  // Clean up any existing test data
  console.log('[Playwright] Cleaning test environment...')

  // You can add database cleanup here if needed
  // await cleanTestDatabase()

  // Create a test user for authentication tests
  await createTestUser(baseURL)

  console.log('[Playwright] Global setup completed')
}

async function createTestUser(baseURL: string) {
  // Create a browser instance for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Navigate to the registration page using the base URL
    await page.goto(`${baseURL}/register`)
    
    // Check if test user already exists by trying to register
    const testEmail = 'e2e-test@example.com'
    const testPassword = 'TestPassword123!'
    
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="name"]', 'E2E Test User')  
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    
    await page.click('button[type="submit"]')
    
    // Wait a moment for registration to process
    await page.waitForTimeout(2000)
    
    console.log('[Playwright] Test user setup completed')
    
  } catch (error) {
    console.log('[Playwright] Test user might already exist or registration failed:', error)
    // Don't fail the setup if user already exists
  } finally {
    await browser.close()
  }
}

export default globalSetup