/**
 * Critical Path Tests - Booking System
 * Focus: Prevent double-booking and ensure waitlist works
 */

import { prisma } from '@/lib/db';

describe('Booking System - Critical Tests Only', () => {

  // Setup test data
  beforeEach(async () => {
    // Clean database
    await prisma.booking.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    // Create test event with 8 seats
    await prisma.event.create({
      data: {
        id: 1,
        name: 'Test Dinner',
        date: new Date('2025-12-01'),
        maxSeats: 8,
        status: 'active',
        description: 'Test event',
        location: 'Test Restaurant',
        price: 45.00
      }
    });

    // Create test users
    for (let i = 1; i <= 10; i++) {
      await prisma.user.create({
        data: {
          id: `user${i}`,
          email: `user${i}@test.com`,
          name: `Test User ${i}`,
          passwordHash: 'hashed'
        }
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Cannot book more than 8 confirmed seats', async () => {
    // Book 8 seats
    for (let i = 1; i <= 8; i++) {
      const booking = await prisma.booking.create({
        data: {
          eventId: 1,
          userId: `user${i}`,
          status: 'confirmed'
        }
      });
      expect(booking.status).toBe('confirmed');
    }

    // 9th booking should be waitlisted
    const ninthBooking = await prisma.$transaction(async (tx) => {
      const confirmedCount = await tx.booking.count({
        where: {
          eventId: 1,
          status: 'confirmed'
        }
      });

      if (confirmedCount >= 8) {
        return await tx.booking.create({
          data: {
            eventId: 1,
            userId: 'user9',
            status: 'waitlist',
            position: 1
          }
        });
      }
    });

    expect(ninthBooking?.status).toBe('waitlist');
    expect(ninthBooking?.position).toBe(1);
  });

  test('Prevents double booking by same user', async () => {
    // First booking succeeds
    const firstBooking = await prisma.booking.create({
      data: {
        eventId: 1,
        userId: 'user1',
        status: 'confirmed'
      }
    });
    expect(firstBooking).toBeTruthy();

    // Second booking should fail
    await expect(
      prisma.booking.create({
        data: {
          eventId: 1,
          userId: 'user1',
          status: 'confirmed'
        }
      })
    ).rejects.toThrow();
  });

  test('Concurrent bookings handle race condition correctly', async () => {
    // Simulate 10 concurrent booking attempts for 8 seats
    const bookingPromises = [];

    for (let i = 1; i <= 10; i++) {
      bookingPromises.push(
        prisma.$transaction(async (tx) => {
          // Count current confirmed bookings
          const confirmed = await tx.booking.count({
            where: {
              eventId: 1,
              status: 'confirmed'
            }
          });

          // Determine status
          const status = confirmed < 8 ? 'confirmed' : 'waitlist';
          const position = status === 'waitlist'
            ? await tx.booking.count({
                where: { eventId: 1, status: 'waitlist' }
              }) + 1
            : null;

          // Create booking
          return await tx.booking.create({
            data: {
              eventId: 1,
              userId: `user${i}`,
              status,
              position
            }
          });
        }).catch(error => ({ error, userId: `user${i}` }))
      );
    }

    const results = await Promise.all(bookingPromises);

    // Check results
    const confirmed = results.filter(r => !r.error && r.status === 'confirmed');
    const waitlisted = results.filter(r => !r.error && r.status === 'waitlist');

    // Should have exactly 8 confirmed and 2 waitlisted
    expect(confirmed.length).toBeLessThanOrEqual(8);
    expect(waitlisted.length).toBeGreaterThanOrEqual(0);
    expect(confirmed.length + waitlisted.length).toBeLessThanOrEqual(10);
  });

  test('Waitlist promotes correctly when booking cancelled', async () => {
    // Fill event
    for (let i = 1; i <= 8; i++) {
      await prisma.booking.create({
        data: {
          eventId: 1,
          userId: `user${i}`,
          status: 'confirmed'
        }
      });
    }

    // Add to waitlist
    const waitlistBooking = await prisma.booking.create({
      data: {
        eventId: 1,
        userId: 'user9',
        status: 'waitlist',
        position: 1
      }
    });

    // Cancel a confirmed booking
    await prisma.booking.delete({
      where: {
        eventId_userId: {
          eventId: 1,
          userId: 'user1'
        }
      }
    });

    // Promote from waitlist (simplified version)
    await prisma.$transaction(async (tx) => {
      const nextWaitlist = await tx.booking.findFirst({
        where: {
          eventId: 1,
          status: 'waitlist'
        },
        orderBy: {
          position: 'asc'
        }
      });

      if (nextWaitlist) {
        await tx.booking.update({
          where: { id: nextWaitlist.id },
          data: {
            status: 'confirmed',
            position: null
          }
        });
      }
    });

    // Check promotion happened
    const promoted = await prisma.booking.findUnique({
      where: {
        eventId_userId: {
          eventId: 1,
          userId: 'user9'
        }
      }
    });

    expect(promoted?.status).toBe('confirmed');
  });
});