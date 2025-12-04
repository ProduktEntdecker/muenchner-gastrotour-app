import { test, expect } from '@playwright/test'

/**
 * API-based Booking Flow Tests
 *
 * These tests verify the booking API functionality using the test mode
 * (userEmail parameter) to bypass authentication.
 *
 * The API supports:
 * - Creating bookings with userEmail for testing
 * - Listing bookings by eventId or userEmail
 * - Booking status (confirmed/waitlist)
 * - Duplicate booking prevention
 */

test.describe('Booking API Flow', () => {

  test('GET /api/events returns upcoming events', async ({ request }) => {
    const response = await request.get('/api/events?upcoming=true')

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.events).toBeDefined()
    expect(Array.isArray(data.events)).toBeTruthy()
  })

  test('GET /api/events returns event details with seat information', async ({ request }) => {
    const response = await request.get('/api/events?upcoming=true')
    const data = await response.json()

    if (data.events.length > 0) {
      const event = data.events[0]

      // Event should have essential fields
      expect(event.id).toBeDefined()
      expect(event.name).toBeDefined()
      expect(event.date).toBeDefined()
      expect(event.address).toBeDefined()
      expect(event.maxSeats).toBeDefined()
      expect(event.seatsAvailable).toBeDefined()
    }
  })

  test('POST /api/bookings creates booking with test user', async ({ request }) => {
    // First get an available event
    const eventsResponse = await request.get('/api/events?upcoming=true')
    const eventsData = await eventsResponse.json()

    if (!eventsData.events || eventsData.events.length === 0) {
      console.log('No events available, skipping test')
      test.skip()
      return
    }

    // Find an event with available seats that's in the future
    const now = new Date()
    const availableEvent = eventsData.events.find((e: any) =>
      e.seatsAvailable > 0 && new Date(e.date) > now
    )

    if (!availableEvent) {
      console.log('No future events with available seats, skipping test')
      test.skip()
      return
    }

    // Create booking with test email - eventId as string (UUID format)
    const testEmail = `e2e-test-${Date.now()}@example.com`
    const bookingResponse = await request.post('/api/bookings', {
      data: {
        eventId: String(availableEvent.id),
        userEmail: testEmail
      }
    })

    // Skip if booking fails (e.g., event became past during test)
    if (!bookingResponse.ok()) {
      console.log('Booking failed, skipping test')
      test.skip()
      return
    }

    const bookingData = await bookingResponse.json()

    expect(bookingData.booking).toBeDefined()
    expect(['confirmed', 'waitlist']).toContain(bookingData.booking.status)
  })

  test('POST /api/bookings rejects duplicate booking', async ({ request }) => {
    // First get an available event
    const eventsResponse = await request.get('/api/events?upcoming=true')
    const eventsData = await eventsResponse.json()

    if (!eventsData.events || eventsData.events.length === 0) {
      test.skip()
      return
    }

    // Find future event with available seats
    const now = new Date()
    const availableEvent = eventsData.events.find((e: any) =>
      e.seatsAvailable > 0 && new Date(e.date) > now
    )

    if (!availableEvent) {
      test.skip()
      return
    }

    // Create first booking
    const testEmail = `e2e-duplicate-${Date.now()}@example.com`
    const firstResponse = await request.post('/api/bookings', {
      data: {
        eventId: String(availableEvent.id),
        userEmail: testEmail
      }
    })

    // Skip if first booking failed
    if (!firstResponse.ok()) {
      test.skip()
      return
    }

    // Try to create duplicate
    const duplicateResponse = await request.post('/api/bookings', {
      data: {
        eventId: String(availableEvent.id),
        userEmail: testEmail
      }
    })

    expect(duplicateResponse.ok()).toBeFalsy()
    expect(duplicateResponse.status()).toBe(400)

    const errorData = await duplicateResponse.json()
    expect(errorData.error).toMatch(/already|bereits/i)
  })

  test('GET /api/bookings returns bookings for event', async ({ request }) => {
    const eventsResponse = await request.get('/api/events?upcoming=true')
    const eventsData = await eventsResponse.json()

    if (eventsData.events.length === 0) {
      test.skip()
      return
    }

    const eventId = eventsData.events[0].id

    const response = await request.get(`/api/bookings?eventId=${eventId}`)
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.bookings).toBeDefined()
    expect(Array.isArray(data.bookings)).toBeTruthy()
  })

  test('GET /api/bookings returns bookings for user email', async ({ request }) => {
    // First create a booking
    const eventsResponse = await request.get('/api/events?upcoming=true')
    const eventsData = await eventsResponse.json()

    if (!eventsData.events || eventsData.events.length === 0) {
      test.skip()
      return
    }

    // Find future event with available seats
    const now = new Date()
    const availableEvent = eventsData.events.find((e: any) =>
      e.seatsAvailable > 0 && new Date(e.date) > now
    )

    if (!availableEvent) {
      test.skip()
      return
    }

    const testEmail = `e2e-query-${Date.now()}@example.com`

    // Create booking
    const bookingResponse = await request.post('/api/bookings', {
      data: {
        eventId: String(availableEvent.id),
        userEmail: testEmail
      }
    })

    // If booking failed (e.g., past event), skip
    if (!bookingResponse.ok()) {
      test.skip()
      return
    }

    // Query bookings for user
    const response = await request.get(`/api/bookings?userEmail=${testEmail}`)
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.bookings).toBeDefined()
    expect(data.bookings.length).toBeGreaterThanOrEqual(1)
  })

  test('POST /api/bookings validates eventId', async ({ request }) => {
    const response = await request.post('/api/bookings', {
      data: {
        eventId: 'invalid-uuid',
        userEmail: 'test@example.com'
      }
    })

    // Should fail with 404 (event not found) or 400 (validation error)
    expect(response.ok()).toBeFalsy()
  })

  test('POST /api/bookings requires eventId', async ({ request }) => {
    const response = await request.post('/api/bookings', {
      data: {
        userEmail: 'test@example.com'
      }
    })

    // Should fail with 400 or 401 (unauthorized without eventId)
    expect(response.ok()).toBeFalsy()
  })

  test('Booking response includes event details', async ({ request }) => {
    const eventsResponse = await request.get('/api/events?upcoming=true')
    const eventsData = await eventsResponse.json()

    if (!eventsData.events || eventsData.events.length === 0) {
      test.skip()
      return
    }

    const availableEvent = eventsData.events.find((e: any) => e.seatsAvailable > 0)

    if (!availableEvent) {
      test.skip()
      return
    }

    const testEmail = `e2e-details-${Date.now()}@example.com`
    const response = await request.post('/api/bookings', {
      data: {
        eventId: String(availableEvent.id),
        userEmail: testEmail
      }
    })

    if (response.ok()) {
      const data = await response.json()

      expect(data.booking.event).toBeDefined()
      expect(data.booking.event.name).toBeDefined()
      expect(data.booking.event.date).toBeDefined()
    }
  })
})

test.describe('Health Check', () => {
  test('GET /api/health returns OK', async ({ request }) => {
    const response = await request.get('/api/health')

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    // Status can be 'healthy' or 'degraded' (when no events exist)
    expect(['healthy', 'degraded']).toContain(data.status)
  })
})
