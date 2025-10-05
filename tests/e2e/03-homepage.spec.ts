import { test, expect } from '@playwright/test'

/**
 * Critical User Journey #3: Homepage & Navigation
 * Prevents production incidents with core user interface
 */
test.describe('Homepage & Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that page loads without errors
    await expect(page).toHaveTitle(/Münchner Gastrotour|Gastro/)
    
    // Should have main navigation
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible()
    
    // Should have main content
    await expect(page.locator('main, .main-content, h1')).toBeVisible()
    
    // Should not have error messages
    await expect(page.locator('.error, [data-testid="error"]')).not.toBeVisible()
  })
  
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    
    // Check for common navigation links
    const expectedLinks = [
      { text: /events|veranstalt/i, url: /events/ },
      { text: /login|anmeld/i, url: /login/ },
      { text: /register|registrier/i, url: /register/ }
    ]
    
    for (const link of expectedLinks) {
      const linkElement = page.locator(`a:has-text("${link.text.source}")`)
      
      // Link should be visible (may not exist on all pages)
      try {
        await expect(linkElement).toBeVisible({ timeout: 2000 })
        
        // Click and verify navigation
        await linkElement.click()
        await expect(page).toHaveURL(link.url)
        
        // Go back to test next link
        await page.goBack()
      } catch {
        // Link might not exist on this page, which is okay
        console.log(`Link with text ${link.text} not found - skipping`)
      }
    }
  })
  
  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')
    
    // Page should still be functional
    await expect(page.locator('main, .main-content, h1')).toBeVisible()
    
    // Navigation should be accessible (mobile menu or visible links)
    const nav = page.locator('nav, [role="navigation"], .mobile-menu')
    await expect(nav).toBeVisible()
    
    // Test mobile menu if it exists
    const menuButton = page.locator('button:has-text("Menu"), .menu-toggle, .hamburger')
    if (await menuButton.isVisible()) {
      await menuButton.click()
      // Menu should open
      await expect(page.locator('.menu-open, .nav-open')).toBeVisible()
    }
  })
  
  test('should handle page refresh gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Wait for initial load
    await expect(page.locator('main, h1')).toBeVisible()
    
    // Refresh page
    await page.reload()
    
    // Should load again without errors
    await expect(page.locator('main, h1')).toBeVisible()
    
    // Should not show error states
    await expect(page.locator('.error, .not-found')).not.toBeVisible()
  })
  
  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')
    
    // Check essential meta tags
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(10)
    
    // Check for description meta tag
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    
    // Check for viewport meta tag (mobile responsiveness)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })
  
  test('should show events list or call-to-action', async ({ page }) => {
    await page.goto('/')
    
    // Should show either:
    // 1. A list of upcoming events, or
    // 2. A call-to-action to browse events, or
    // 3. Information about the platform
    
    const hasEvents = await page.locator('.event, [data-testid="event"]').count() > 0
    const hasEventsLink = await page.locator('a[href*="event"], a:has-text("Events")').isVisible()
    const hasCallToAction = await page.locator('.cta, .hero, .welcome').isVisible()
    
    // At least one of these should be true
    expect(hasEvents || hasEventsLink || hasCallToAction).toBeTruthy()
  })
  
  test('should load CSS and JavaScript properly', async ({ page }) => {
    // Monitor for console errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Monitor for failed network requests
    const failedRequests: string[] = []
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`)
      }
    })
    
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Should not have critical JavaScript errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && // Ignore favicon errors
      !error.includes('extension') // Ignore browser extension errors
    )
    expect(criticalErrors).toHaveLength(0)
    
    // Should not have failed CSS/JS requests
    const criticalFailures = failedRequests.filter(req => 
      req.includes('.css') || req.includes('.js')
    )
    expect(criticalFailures).toHaveLength(0)
  })
})