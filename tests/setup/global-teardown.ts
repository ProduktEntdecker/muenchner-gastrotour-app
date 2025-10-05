/**
 * Global teardown for Playwright tests
 * Runs once after all tests to clean up test environment
 */
async function globalTeardown() {
  console.log('[Playwright] Global teardown started')
  
  // Clean up test data
  // await cleanupTestData()
  
  console.log('[Playwright] Global teardown completed')
}

export default globalTeardown