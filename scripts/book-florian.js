const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function bookFlorian() {
  // Get Florian's user ID
  const { data: users } = await supabase.auth.admin.listUsers();
  const florian = users.users.find(u => u.email === 'florian.steiner@mac.com');

  if (!florian) {
    console.log('Florian not found!');
    return;
  }

  console.log('Florian ID:', florian.id);

  // Get all future events
  const now = new Date().toISOString();
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .gte('date', now)
    .order('date', { ascending: true });

  if (eventsError) {
    console.log('Error fetching events:', eventsError);
    return;
  }

  console.log('\nFuture events:', events.length);

  for (const event of events) {
    // Check if already booked
    const { data: existing } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_id', event.id)
      .eq('user_id', florian.id)
      .single();

    if (existing) {
      console.log('Already booked:', event.title || event.id);
      continue;
    }

    // Create booking
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        event_id: event.id,
        user_id: florian.id,
        status: 'confirmed',
        created_at: new Date().toISOString()
      });

    if (bookingError) {
      console.log('Error booking event', event.id, ':', bookingError.message);
    } else {
      console.log('Booked:', event.title || 'Event', event.date);
    }
  }

  // Verify bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, events(*)')
    .eq('user_id', florian.id);

  console.log('\n=== FLORIAN BOOKINGS ===');
  console.log('Total:', bookings?.length || 0);
  bookings?.forEach(b => console.log('-', b.events?.title || b.event_id, '|', b.status));
}

bookFlorian();
