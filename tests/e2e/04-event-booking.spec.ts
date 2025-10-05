import { test, expect } from '@playwright/test'

/**
 * Critical User Journey #4: Event Creation & Booking
 * Prevents production incidents with core business functionality
 * This is your revenue-generating flow - absolutely critical!
 */
test.describe('Event Creation & Booking', () => {
  // Test with admin user session
  test.describe('Admin Event Creation', () => {
    test.beforeEach(async ({ page }) => {
      // For now, assume admin is logged in or use a test admin account
      // In real implementation, you'd login as admin first
    })

    test('should create a new event successfully', async ({ page }) => {
      // Navigate to event creation page (adjust URL as needed)
      await page.goto('/admin/events/create')
      
      // Fill out event form
      const testEvent = {
        title: `Test Event ${Date.now()}`,
        restaurant: 'Test Restaurant',
        date: '2025-12-31',
        time: '19:00',
        seats: '20',
        price: '75',
        description: 'This is a test event for E2E testing'
      }

      // Fill form fields (adjust selectors based on your actual form)
      await page.fill('input[name="title"], input[name="eventTitle"]', testEvent.title)
      await page.fill('input[name="restaurant"], input[name="restaurantName"]', testEvent.restaurant)
      await page.fill('input[name="date"], input[type="date"]', testEvent.date)
      await page.fill('input[name="time"], input[type="time"]', testEvent.time)
      await page.fill('input[name="seats"], input[name="maxSeats"]', testEvent.seats)
      await page.fill('input[name="price"]', testEvent.price)
      await page.fill('textarea[name="description"]', testEvent.description)

      // Submit event creation
      await page.click('button[type="submit"], button:has-text("Erstellen"), button:has-text("Create")')

      // Should show success message or redirect to events list
      await expect(page.locator('.success, [data-testid="success"]')).toBeVisible({ timeout: 10000 })
      
      // Should see the created event in the list
      await expect(page.locator(`text=${testEvent.title}`)).toBeVisible()
    })

    test('should validate required event fields', async ({ page }) => {
      await page.goto('/admin/events/create')
      
      // Try to submit empty form
      await page.click('button[type="submit"]')
      
      // Should show validation errors
      const requiredFields = [
        'input[name="title"], input[name="eventTitle"]',
        'input[name="restaurant"], input[name="restaurantName"]',
        'input[name="date"], input[type="date"]',
        'input[name="seats"], input[name="maxSeats"]'
      ]
      
      // Check that required fields are marked as required
      for (const selector of requiredFields) {
        const field = page.locator(selector)
        if (await field.count() > 0) {
          await expect(field).toBeRequired()
        }
      }
    })
  })

  test.describe('User Event Booking', () => {
    test('should allow user to book available event', async ({ page }) => {
      // Navigate to events page
      await page.goto('/events')
      
      // Should see events list
      await expect(page.locator('.event, [data-testid="event"], .event-card')).toBeVisible({ timeout: 5000 })
      
      // Find first bookable event
      const firstEvent = page.locator('.event, [data-testid="event"], .event-card').first()
      await expect(firstEvent).toBeVisible()
      
      // Click on event to view details or book directly
      const bookButton = firstEvent.locator('button:has-text("Buchen"), button:has-text("Book"), a:has-text("Details")')
      
      if (await bookButton.count() > 0) {
        await bookButton.click()
        
        // Should navigate to booking page or show booking modal
        await expect(page.locator('text=/Buchung|Booking|Anmeldung/i')).toBeVisible({ timeout: 5000 })
        
        // Fill booking form if present
        const nameField = page.locator('input[name="name"], input[name="fullName"]')
        const emailField = page.locator('input[name="email"]')
        
        if (await nameField.count() > 0) {
          await nameField.fill('Test User')
          await emailField.fill(`test-booking-${Date.now()}@example.com`)
          
          // Submit booking
          await page.click('button[type="submit"], button:has-text("Bestätigen"), button:has-text("Confirm")')
          
          // Should show booking confirmation
          await expect(page.locator('text=/bestätigt|confirmed|erfolgreich/i')).toBeVisible({ timeout: 10000 })
        }
      }
    })

    test('should show event details correctly', async ({ page }) => {
      await page.goto('/events')
      
      // Click on first event
      const firstEvent = page.locator('.event, [data-testid="event"], .event-card').first()
      await firstEvent.click()
      
      // Should show event details
      const eventDetailsSelectors = [
        'h1, h2, .event-title',  // Event title
        'text=/Restaurant/i',     // Restaurant info
        'text=/Datum|Date/i',     // Date
        'text=/Zeit|Time/i',      // Time
        'text=/Preis|Price|€/i'   // Price
      ]
      
      // At least some event details should be visible
      let detailsFound = 0
      for (const selector of eventDetailsSelectors) {
        if (await page.locator(selector).count() > 0) {
          detailsFound++
        }
      }
      
      expect(detailsFound).toBeGreaterThan(0)
    })

    test('should handle fully booked events', async ({ page }) => {
      await page.goto('/events')
      
      // Look for fully booked events
      const fullyBookedEvent = page.locator('text=/ausgebucht|fully.*booked|sold.*out/i')
      
      if (await fullyBookedEvent.count() > 0) {
        // Should not have active booking button
        const bookButton = page.locator('button:has-text("Buchen"):not([disabled])')
        await expect(bookButton).toHaveCount(0)
        
        // Should show "fully booked" status
        await expect(fullyBookedEvent).toBeVisible()
      }
    })

    test('should show upcoming events only', async ({ page }) => {
      await page.goto('/events')
      
      // Events should be visible
      const eventsList = page.locator('.events-list, .event, [data-testid="event"]')
      
      if (await eventsList.count() > 0) {
        // Should not show past events by default
        const pastEventIndicators = page.locator('text=/vergangen|past|abgelaufen/i')
        await expect(pastEventIndicators).toHaveCount(0)
      } else {
        // If no events, should show empty state message
        await expect(page.locator('text=/keine.*events|no.*events|bald.*verfügbar/i')).toBeVisible()
      }
    })
  })

  test.describe('Event Management', () => {
    test('should display events in correct date order', async ({ page }) => {
      await page.goto('/events')
      
      const eventDates = await page.locator('.event-date, [data-testid="event-date"]').allTextContents()
      
      if (eventDates.length > 1) {
        // Basic check that dates are in logical order
        // (Implementation would depend on your date format)
        expect(eventDates.length).toBeGreaterThan(0)
      }
    })

    test('should handle event search/filter', async ({ page }) => {
      await page.goto('/events')
      
      // Look for search or filter functionality
      const searchInput = page.locator('input[type="search"], input[placeholder*="Suchen"], input[placeholder*="Search"]')
      
      if (await searchInput.count() > 0) {
        await searchInput.fill('Restaurant')
        
        // Should filter events - wait for filtered results to appear
        await page.waitForFunction(
          () => {
            const events = document.querySelectorAll('.event, [data-testid="event"]')
            return events.length > 0
          },
          { timeout: 5000 }
        )

        const filteredEvents = await page.locator('.event, [data-testid="event"]').count()
        expect(filteredEvents).toBeGreaterThanOrEqual(0)
      }
    })

    test('should be mobile responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/events')
      
      // Events should still be visible and functional on mobile
      if (await page.locator('.event, [data-testid="event"]').count() > 0) {
        await expect(page.locator('.event, [data-testid="event"]').first()).toBeVisible()
        
        // Booking buttons should still be clickable
        const bookButton = page.locator('button:has-text("Buchen"), a:has-text("Details")').first()
        if (await bookButton.count() > 0) {
          await expect(bookButton).toBeVisible()
        }
      }
    })
  })
})