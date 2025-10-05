import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendBookingConfirmation } from '@/lib/email';

// DELETE /api/bookings/[id] - Cancel booking
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

    const bookingId = params.id;

    // Get booking with event details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        events (*)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only cancel your own bookings' },
        { status: 403 }
      );
    }

    // Check if event has already happened
    if (new Date(booking.events.date) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel bookings for past events' },
        { status: 400 }
      );
    }

    // Delete the booking
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (deleteError) {
      console.error('Error deleting booking:', deleteError);
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }

    // If booking was confirmed, check for waitlist promotions
    if (booking.status === 'confirmed') {
      // Get next person on waitlist
      const { data: nextWaitlist } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles (*)
        `)
        .eq('event_id', booking.event_id)
        .eq('status', 'waitlist')
        .order('position', { ascending: true })
        .limit(1)
        .single();

      if (nextWaitlist) {
        // Promote from waitlist to confirmed
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            position: null
          })
          .eq('id', nextWaitlist.id);

        if (!updateError) {
          // Update remaining waitlist positions
          await supabase.rpc('update_waitlist_positions', {
            p_event_id: booking.event_id
          }).catch(err => {
            // If the RPC doesn't exist, manually update positions
            console.log('Waitlist position update skipped');
          });

          // Send confirmation email to promoted user
          if (nextWaitlist.profiles?.email) {
            try {
              await sendBookingConfirmation(
                nextWaitlist.profiles.email,
                nextWaitlist.profiles.full_name || 'Guest',
                booking.events.name,
                booking.events.date,
                booking.events.address,
                'confirmed'
              );
            } catch (emailError) {
              console.error('Failed to send promotion notification:', emailError);
            }
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

// GET /api/bookings/[id] - Get booking details
export async function GET(
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

    const bookingId = params.id;

    // Get booking with event details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (*),
        profiles (*)
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check ownership (unless user is admin - could add admin check here)
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only view your own bookings' },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}