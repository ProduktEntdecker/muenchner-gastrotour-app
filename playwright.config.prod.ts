import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for Production Testing
 *
 * This config runs tests against the live production site instead of localhost.
 * Advantage: No need to manage local environment variables.
 * Disadvantage: Tests run against real production data.
 *
 * Usage: npx playwright test --config=playwright.config.prod.ts
 */
export default defineConfig({
  testDir: './tests/e2e',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
  ],

  use: {
    // Test against production instead of localhost
    baseURL: 'https://muenchner-gastrotour-app.vercel.app',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // No webServer needed - we're testing production!
  // This eliminates the entire timeout issue

  // Global setup still needed for test user creation
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
  },
})
