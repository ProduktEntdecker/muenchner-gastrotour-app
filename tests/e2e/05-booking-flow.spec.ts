import { test, expect } from '@playwright/test'

/**
 * TDD E2E Tests for Booking Flow
 *
 * These tests define the expected behavior for the booking system.
 * They will FAIL initially - that's expected and correct for TDD!
 *
 * User Stories Covered:
 * 1. User can book an available event (confirmed)
 * 2. User can book a full event (waitlist)
 * 3. User can view their bookings
 * 4. User can cancel a booking
 * 5. Waitlist auto-promotion on cancellation
 * 6. No duplicate bookings
 */

test.describe('Booking Flow - TDD', () => {
  let testEventId: string
  let testUserId: string

  // Helper function to create a test event via API
  async function createTestEvent(page: any, maxSeats: number = 2) {
    const response = await page.request.post('/api/events', {
      data: {
        name: `Test Event ${Date.now()}`,
        description: 'E2E Test Event',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        address: 'Test Restaurant, Munich',
        maxSeats,
        cuisineType: 'Bavarian'
      }
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    return data.event.id
  }

  // Helper to login a test user
  async function loginTestUser(page: any, userEmail: string) {
    // For now, we'll use API-based auth
    // In real implementation, this would go through the login flow
    const response = await page.request.post('/api/auth/login', {
      data: { email: userEmail }
    })

    if (response.ok()) {
      const data = await response.json()
      return data.userId
    }
    return null
  }

  test.beforeEach(async ({ page }) => {
    // Create a test event for each test
    testEventId = await createTestEvent(page, 2) // 2 seats available
  })

  test('User can book an available event and get confirmed status', async ({ page }) => {
    // ARRANGE: User wants to book an event with available seats
    const userEmail = `test-user-${Date.now()}@example.com`

    // ACT: User creates a booking
    const response = await page.request.post('/api/bookings', {
      data: {
        eventId: testEventId,
        userEmail
      }
    })

    // ASSERT: Booking is created with confirmed status
    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.booking).toBeDefined()
    expect(data.booking.eventId).toBe(testEventId)
    expect(data.booking.status).toBe('confirmed')
    expect(data.booking.position).toBeNull() // Not on waitlist

    // Verify booking persists
    const getResponse = await page.request.get(`/api/bookings?eventId=${testEventId}`)
    expect(getResponse.ok()).toBeTruthy()
    const bookings = await getResponse.json()
    expect(bookings.bookings.length).toBe(1)
    expect(bookings.bookings[0].status).toBe('confirmed')
  })

  test('User booking a full event gets waitlist status', async ({ page }) => {
    // ARRANGE: Fill all available seats first
    await page.request.post('/api/bookings', {
      data: {
        eventId: testEventId,
        userEmail: 'user1@example.com'
      }
    })

    await page.request.post('/api/bookings', {
      data: {
        eventId: testEventId,
        userEmail: 'user2@example.com'
      }
    })

    // ACT: Third user tries to book (event is now full)
    const response = await page.request.post('/api/bookings', {
      data: {
        eventId: testEventId,
        userEmail: 'user3@example.com'
      }
    })

    // ASSERT: User gets waitlist status
    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.booking.status).toBe('waitlist')
    expect(data.booking.position).toBe(1) // First in waitlist
    expect(data.message).toContain('waitlist')
  })

  test('User can view their bookings', async ({ page }) => {
    // ARRANGE: Create multiple bookings for the user
    const userEmail = 'user-bookings@example.com'

    const event1 = await createTestEvent(page)
    const event2 = await createTestEvent(page)

    await page.request.post('/api/bookings', {
      data: { eventId: event1, userEmail }
    })

    await page.request.post('/api/bookings', {
      data: { eventId: event2, userEmail }
    })

    // ACT: Get user's bookings
    const response = await page.request.get(`/api/bookings?userEmail=${userEmail}`)

    // ASSERT: Returns all user's bookings
    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.bookings).toBeDefined()
    expect(data.bookings.length).toBeGreaterThanOrEqual(2)
    expect(data.bookings.every((b: any) => b.status === 'confirmed')).toBeTruthy()
  })

  test('User can cancel their booking', async ({ page }) => {
    // ARRANGE: User has a confirmed booking
    const userEmail = 'user-cancel@example.com'

    const createResponse = await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail }
    })

    const { booking } = await createResponse.json()

    // ACT: User cancels the booking
    const response = await page.request.delete(`/api/bookings/${booking.id}`)

    // ASSERT: Booking is cancelled
    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.booking.status).toBe('cancelled')

    // Verify booking no longer counts towards event capacity
    const eventResponse = await page.request.get(`/api/events/${testEventId}`)
    const eventData = await eventResponse.json()
    expect(eventData.event.seatsAvailable).toBe(2) // Back to full capacity
  })

  test('Waitlist user is auto-promoted when booking is cancelled', async ({ page }) => {
    // ARRANGE: Fill event and create waitlist
    await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail: 'user1@example.com' }
    })

    const user2Response = await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail: 'user2@example.com' }
    })
    const user2Booking = (await user2Response.json()).booking

    // User 3 goes to waitlist
    const user3Response = await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail: 'user3@example.com' }
    })
    const user3Booking = (await user3Response.json()).booking

    expect(user3Booking.status).toBe('waitlist')
    expect(user3Booking.position).toBe(1)

    // ACT: User 2 cancels their confirmed booking
    await page.request.delete(`/api/bookings/${user2Booking.id}`)

    // ASSERT: User 3 is automatically promoted to confirmed
    const checkResponse = await page.request.get(`/api/bookings/${user3Booking.id}`)
    const updatedBooking = (await checkResponse.json()).booking

    expect(updatedBooking.status).toBe('confirmed')
    expect(updatedBooking.position).toBeNull()
  })

  test('User cannot book the same event twice', async ({ page }) => {
    // ARRANGE: User already has a booking
    const userEmail = 'duplicate-user@example.com'

    await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail }
    })

    // ACT: User tries to book same event again
    const response = await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail }
    })

    // ASSERT: Request is rejected
    expect(response.ok()).toBeFalsy()
    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toContain('already booked')
  })

  test('Event shows updated seat availability after bookings', async ({ page }) => {
    // ARRANGE: Event starts with 2 seats
    const initialResponse = await page.request.get(`/api/events/${testEventId}`)
    const initialData = await initialResponse.json()
    expect(initialData.event.seatsAvailable).toBe(2)

    // ACT: One user books
    await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail: 'seat-test@example.com' }
    })

    // ASSERT: Seats available decreased
    const updatedResponse = await page.request.get(`/api/events/${testEventId}`)
    const updatedData = await updatedResponse.json()

    expect(updatedData.event.seatsAvailable).toBe(1)
    expect(updatedData.event.seatsTaken).toBe(1)
  })

  test('Booking includes event details in response', async ({ page }) => {
    // ACT: Create a booking
    const response = await page.request.post('/api/bookings', {
      data: {
        eventId: testEventId,
        userEmail: 'event-details@example.com'
      }
    })

    // ASSERT: Response includes event information
    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.booking.event).toBeDefined()
    expect(data.booking.event.name).toBeDefined()
    expect(data.booking.event.date).toBeDefined()
    expect(data.booking.event.address).toBeDefined()
  })

  test('Multiple waitlist users are promoted in correct order', async ({ page }) => {
    // ARRANGE: Fill event and create multiple waitlist entries
    await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail: 'confirmed1@example.com' }
    })

    const confirmedBooking = await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail: 'confirmed2@example.com' }
    })
    const toCancel = (await confirmedBooking.json()).booking

    // Create waitlist (in order)
    const waitlist1 = await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail: 'waitlist1@example.com' }
    })

    const waitlist2 = await page.request.post('/api/bookings', {
      data: { eventId: testEventId, userEmail: 'waitlist2@example.com' }
    })

    const booking1 = (await waitlist1.json()).booking
    const booking2 = (await waitlist2.json()).booking

    expect(booking1.position).toBe(1)
    expect(booking2.position).toBe(2)

    // ACT: Cancel confirmed booking
    await page.request.delete(`/api/bookings/${toCancel.id}`)

    // ASSERT: First waitlist user promoted, second moves up
    const check1 = await page.request.get(`/api/bookings/${booking1.id}`)
    const check2 = await page.request.get(`/api/bookings/${booking2.id}`)

    const updated1 = (await check1.json()).booking
    const updated2 = (await check2.json()).booking

    expect(updated1.status).toBe('confirmed')
    expect(updated1.position).toBeNull()

    expect(updated2.status).toBe('waitlist')
    expect(updated2.position).toBe(1) // Moved from position 2 to 1
  })
})
