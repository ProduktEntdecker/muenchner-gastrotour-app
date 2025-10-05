#!/usr/bin/env node

/**
 * Test script for booking flow
 * Tests the complete user journey from registration to booking
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const timestamp = Date.now();
const testUser = {
  email: `testuser${timestamp}@gmail.com`,
  password: 'Xq9#mK2$pL7@nR4!',
  name: 'Test User'
};

async function fetchWithCookies(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Origin': BASE_URL,
      ...options.headers
    },
    credentials: 'include'
  });

  const data = await response.json().catch(() => null);
  return { response, data };
}

async function testFlow() {
  console.log('🔍 Starting booking flow test...\n');

  try {
    // 1. Register new user
    console.log('1️⃣ Registering new user...');
    const { response: regResponse, data: regData } = await fetchWithCookies(
      `${BASE_URL}/api/auth/register`,
      {
        method: 'POST',
        body: JSON.stringify(testUser)
      }
    );

    if (!regResponse.ok) {
      throw new Error(`Registration failed: ${regData?.error || regResponse.statusText}`);
    }
    console.log('✅ User registered successfully\n');

    // 2. Login
    console.log('2️⃣ Logging in...');
    const { response: loginResponse, data: loginData } = await fetchWithCookies(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      }
    );

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData?.error || loginResponse.statusText}`);
    }
    console.log('✅ Logged in successfully\n');

    // 3. Get events
    console.log('3️⃣ Fetching events...');
    const { response: eventsResponse, data: eventsData } = await fetchWithCookies(
      `${BASE_URL}/api/events`
    );

    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch events: ${eventsData?.error || eventsResponse.statusText}`);
    }

    const events = eventsData.events || [];
    console.log(`✅ Found ${events.length} events`);

    if (events.length === 0) {
      console.log('⚠️ No events available to test booking\n');
      return;
    }

    const nextEvent = events[0];
    console.log(`   Next event: ${nextEvent.name} on ${new Date(nextEvent.date).toLocaleDateString()}`);
    console.log(`   Available seats: ${nextEvent.seatsAvailable}/${nextEvent.maxSeats}\n`);

    // 4. Make a booking
    console.log('4️⃣ Creating booking...');
    const { response: bookingResponse, data: bookingData } = await fetchWithCookies(
      `${BASE_URL}/api/bookings`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId: nextEvent.id })
      }
    );

    if (!bookingResponse.ok) {
      throw new Error(`Booking failed: ${bookingData?.error || bookingResponse.statusText}`);
    }

    console.log(`✅ Booking created successfully!`);
    console.log(`   Status: ${bookingData.booking.status}`);
    if (bookingData.booking.status === 'waitlist') {
      console.log(`   Waitlist position: ${bookingData.booking.position}`);
    }
    console.log('');

    // 5. Get user's bookings
    console.log('5️⃣ Fetching user bookings...');
    const { response: myBookingsResponse, data: myBookingsData } = await fetchWithCookies(
      `${BASE_URL}/api/bookings`
    );

    if (!myBookingsResponse.ok) {
      throw new Error(`Failed to fetch bookings: ${myBookingsData?.error || myBookingsResponse.statusText}`);
    }

    console.log(`✅ Found ${myBookingsData.bookings.length} booking(s)\n`);

    // 6. Cancel the booking
    console.log('6️⃣ Cancelling booking...');
    const bookingId = bookingData.booking.id;
    const { response: cancelResponse, data: cancelData } = await fetchWithCookies(
      `${BASE_URL}/api/bookings/${bookingId}`,
      {
        method: 'DELETE'
      }
    );

    if (!cancelResponse.ok) {
      throw new Error(`Failed to cancel booking: ${cancelData?.error || cancelResponse.statusText}`);
    }

    console.log('✅ Booking cancelled successfully\n');

    // 7. Logout
    console.log('7️⃣ Logging out...');
    const { response: logoutResponse } = await fetchWithCookies(
      `${BASE_URL}/api/auth/logout`,
      {
        method: 'POST'
      }
    );

    if (!logoutResponse.ok) {
      throw new Error('Logout failed');
    }
    console.log('✅ Logged out successfully\n');

    console.log('🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testFlow();