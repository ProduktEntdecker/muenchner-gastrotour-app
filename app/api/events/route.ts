import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Format events with seat availability
    const formattedEvents = events.map(event => {
      const confirmedBookings = event.bookings?.filter(b => b.status === 'confirmed') || [];
      const seatsTaken = confirmedBookings.length;
      
      return {
        id: event.id,
        name: event.name,
        date: event.date,
        address: event.address,
        description: event.description,
        menuUrl: event.menu_url,
        maxSeats: event.max_seats,
        seatsAvailable: Math.max(0, event.max_seats - seatsTaken),
        seatsTaken: seatsTaken,
        cuisineType: event.cuisine_type,
        attendees: confirmedBookings.map(b => ({
          id: (b.profiles as any)?.id || b.user_id,
          name: (b.profiles as any)?.full_name || 'Unknown'
        }))
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
