import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SimpleErrorTracker, handleApiError } from '@/lib/simple-error-tracker'
import { applyRateLimit, RATE_LIMITS } from '@/lib/simple-rate-limiter'
import { cookies } from 'next/headers';
import { sendBookingConfirmation } from '@/lib/email';

// GET /api/bookings - List user's bookings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'confirmed';

    // Fetch bookings with event details
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    await applyRateLimit(RATE_LIMITS.bookingsCreate, request);

    // CSRF protection: validate origin
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || `https://${host}`;

    // Only validate origin if it's present (browser requests)
    if (origin && origin !== expectedOrigin && !origin.includes('localhost')) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { eventId } = body;

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Valid event ID is required' },
        { status: 400 }
      );
    }

    // Check if event exists and get booking count
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        bookings!inner (
          id,
          status
        )
      `)
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book past events' },
        { status: 400 }
      );
    }

    // Check if user already has a booking
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this event' },
        { status: 400 }
      );
    }

    // Count confirmed bookings
    const { count: confirmedCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    // Check if event is full
    const isEventFull = (confirmedCount || 0) >= (event.max_seats || 8);
    const bookingStatus = isEventFull ? 'waitlist' : 'confirmed';

    // Calculate waitlist position if needed
    let position = null;
    if (isEventFull) {
      const { count: waitlistCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'waitlist');
      position = (waitlistCount || 0) + 1;
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_id: eventId,
        user_id: user.id,
        status: bookingStatus,
        position
      })
      .select(`
        *,
        events (*),
        profiles (*)
      `)
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await sendBookingConfirmation(
        user.email!,
        booking.profiles?.full_name || 'Guest',
        booking.events?.name || '',
        booking.events?.date || '',
        booking.events?.address || '',
        bookingStatus
      );
    } catch (emailError) {
      console.error('Failed to send booking confirmation:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      booking,
      message: bookingStatus === 'waitlist'
        ? `Event is full. You've been added to the waitlist at position ${position}`
        : 'Booking confirmed successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);

    // Handle database constraint errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint') || error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'You have already booked this event' },
          { status: 400 }
        );
      }
      if (error.message.includes('Foreign key constraint') || error.message.includes('foreign key')) {
        return NextResponse.json(
          { error: 'Invalid event or user reference' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}