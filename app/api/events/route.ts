import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

/**
 * POST /api/events - Create new event (for testing)
 * Uses service role client to bypass RLS policies
 */
export async function POST(request: NextRequest) {
  try {
    // Use service role client to bypass RLS for test event creation
    const supabase = createServiceRoleClient();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { name, description, date, address, maxSeats, cuisineType, imageUrl } = body;

    // Normalize imageUrl - trim and validate non-empty string
    const normalizedImageUrl =
      typeof imageUrl === 'string' && imageUrl.trim()
        ? imageUrl.trim()
        : null;

    if (!name || !date || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, date, address' },
        { status: 400 }
      );
    }

    // Create event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        name: name.trim(),
        description: description?.trim() || '',
        date: new Date(date).toISOString(),
        address: address.trim(),
        max_seats: maxSeats || 7,
        cuisine_type: cuisineType || null,
        image_url: normalizedImageUrl,
        status: 'upcoming',
        host_counts_as_seat: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events - List all events (public)
 * Fetches events from Supabase with booking information
 *
 * Query parameters:
 * - upcoming: 'true' to get only future events
 * - limit: maximum number of events to return (default: 10)
 * - offset: number of events to skip (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    // Get current user for review status
    const { data: { user } } = await supabase.auth.getUser()

    // Build query for events
    let eventsQuery = supabase
      .from('events')
      .select(`
        id,
        name,
        description,
        date,
        address,
        lat,
        lng,
        homepage,
        menu_url,
        image_url,
        press_review,
        press_source,
        max_seats,
        host_counts_as_seat,
        status,
        created_at,
        cuisine_type,
        bookings!bookings_event_id_fkey(
          id,
          user_id,
          status,
          profiles!bookings_user_id_fkey(
            id,
            full_name
          )
        ),
        reviews(
          id,
          user_id,
          food_rating,
          ambiance_rating,
          service_rating
        )
      `);

    // Filter for upcoming events if requested
    if (upcoming) {
      eventsQuery = eventsQuery
        .eq('status', 'upcoming')
        .gte('date', new Date().toISOString());
    }

    // Apply ordering and pagination
    eventsQuery = eventsQuery
      .order('date', { ascending: upcoming })
      .range(offset, offset + limit - 1);

    const { data: events, error } = await eventsQuery;

    if (error) {
      console.error('Supabase error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Format events with seat availability and reviews
    const formattedEvents = events.map(event => {
      const confirmedBookings = event.bookings?.filter(b => b.status === 'confirmed') || [];
      const seatsTaken = confirmedBookings.length;
      const reviews = event.reviews || [];

      // Calculate average ratings
      const avgRating = reviews.length > 0 ? {
        food: reviews.reduce((sum, r) => sum + (r.food_rating || 0), 0) / reviews.length,
        ambiance: reviews.reduce((sum, r) => sum + (r.ambiance_rating || 0), 0) / reviews.length,
        service: reviews.reduce((sum, r) => sum + (r.service_rating || 0), 0) / reviews.length,
        overall: reviews.reduce((sum, r) => {
          const avg = ((r.food_rating || 0) + (r.ambiance_rating || 0) + (r.service_rating || 0)) / 3
          return sum + avg
        }, 0) / reviews.length
      } : null;

      // Check if current user has attended and reviewed
      const userBooking = user
        ? confirmedBookings.find(b => b.user_id === user.id)
        : null;
      const userReview = user
        ? reviews.find(r => r.user_id === user.id)
        : null;

      return {
        id: event.id,
        name: event.name,
        date: event.date,
        address: event.address,
        description: event.description,
        menuUrl: event.menu_url,
        imageUrl: event.image_url,
        pressReview: event.press_review,
        pressSource: event.press_source,
        maxSeats: event.max_seats,
        seatsAvailable: Math.max(0, event.max_seats - seatsTaken),
        seatsTaken: seatsTaken,
        cuisineType: event.cuisine_type,
        attendees: confirmedBookings.map(b => ({
          id: (b.profiles as { id: string } | null)?.id || b.user_id,
          name: (b.profiles as { full_name: string } | null)?.full_name || 'Unknown'
        })),
        // Review data
        reviewCount: reviews.length,
        averageRating: avgRating,
        userAttended: !!userBooking,
        userReviewed: !!userReview
      };
    });

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
