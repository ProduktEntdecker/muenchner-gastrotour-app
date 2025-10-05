import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Testing Configuration
 * Tests the 5 critical user journeys to prevent production incidents
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    // Add JUnit for CI integration
    process.env.CI ? ['junit', { outputFile: 'test-results.xml' }] : null
  ].filter(Boolean),
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure  
    video: 'retain-on-failure',
    
    // Global test timeout
    actionTimeout: 10 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    // Only run other browsers on CI for full coverage
    ...(process.env.CI ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
      }
    ] : [])
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    
    // Wait for server to be ready
    timeout: 120 * 1000,
    
    // Environment variables for test server
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3001',
    }
  },
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),
  
  // Test timeout
  timeout: 30 * 1000,
  
  // Global test configuration
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 5000,
  },
});