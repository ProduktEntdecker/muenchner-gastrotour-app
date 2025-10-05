import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/events/[id] - Get event details
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const supabase = await createClient();

    // Get event with booking count
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        bookings (
          id,
          user_id,
          status,
          profiles (
            id,
            full_name,
            avatar_url
          )
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

    // Count confirmed bookings
    const confirmedBookings = event.bookings?.filter((b: any) => b.status === 'confirmed') || [];
    const waitlistBookings = event.bookings?.filter((b: any) => b.status === 'waitlist') || [];

    // Check authentication to see if user is registered
    const { data: { user } } = await supabase.auth.getUser();

    let userBooking = null;
    if (user) {
      userBooking = event.bookings?.find((b: any) => b.user_id === user.id);
    }

    // Format response
    const response = {
      ...event,
      seatsAvailable: Math.max(0, (event.max_seats || 8) - confirmedBookings.length),
      attendees: confirmedBookings.map((b: any) => ({
        id: b.profiles?.id,
        name: b.profiles?.full_name || 'Anonymous',
        avatarUrl: b.profiles?.avatar_url
      })),
      waitlistCount: waitlistBookings.length,
      userBooking: userBooking ? {
        id: userBooking.id,
        status: userBooking.status,
        position: userBooking.position
      } : null
    };

    // Remove raw bookings data from response
    delete response.bookings;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const eventId = params.id;

    // Get request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
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
      status
    } = body;

    // Prepare update data - only include fields that were provided
    const updateData: any = {};
    if (name !== undefined) updateData.name = name?.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (date !== undefined) updateData.date = new Date(date).toISOString();
    if (address !== undefined) updateData.address = address?.trim();
    if (lat !== undefined) updateData.lat = lat;
    if (lng !== undefined) updateData.lng = lng;
    if (homepage !== undefined) updateData.homepage = homepage?.trim();
    if (menu_url !== undefined) updateData.menu_url = menu_url?.trim();
    if (max_seats !== undefined) updateData.max_seats = max_seats;
    if (host_counts_as_seat !== undefined) updateData.host_counts_as_seat = host_counts_as_seat;
    if (status !== undefined) updateData.status = status;

    // Update event
    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const eventId = params.id;

    // Check if event exists
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete event (will cascade to bookings due to foreign key constraint)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}