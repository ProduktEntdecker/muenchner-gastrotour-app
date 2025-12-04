import { FullConfig } from '@playwright/test'

/**
 * Global setup for Playwright tests
 * Runs once before all tests to prepare test environment
 *
 * Note: Test user creation is skipped because:
 * 1. Registration requires invitation code (not available in tests)
 * 2. Email confirmation may be required
 * 3. Tests should work against production data
 */
async function globalSetup(config: FullConfig) {
  console.log('[Playwright] Global setup started')

  // Get base URL from config
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3001'
  console.log(`[Playwright] Using base URL: ${baseURL}`)

  // Verify the application is accessible
  try {
    const response = await fetch(`${baseURL}/api/health`)
    if (response.ok) {
      console.log('[Playwright] Health check passed')
    } else {
      console.warn('[Playwright] Health check returned non-OK status:', response.status)
    }
  } catch (error) {
    console.warn('[Playwright] Health check failed (may be expected if testing locally):', error)
  }

  console.log('[Playwright] Global setup completed')
}

export default globalSetup
