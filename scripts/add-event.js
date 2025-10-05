#!/usr/bin/env node

/**
 * Script to add a new event to the Münchner Gastrotour database
 * Usage: node scripts/add-event.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Event data for the next planned event
const newEvent = {
  name: 'Italienische Küche im Zentrum',
  description: 'Ein Abend mit authentischer italienischer Küche im Herzen Münchens. Wir erkunden die traditionellen Aromen der italienischen Küche in einem gemütlichen Ambiente.',
  date: '2025-10-15T19:00:00+02:00', // October 15, 2025, 7:00 PM CEST
  address: 'Marienplatz 8, 80331 München',
  lat: 48.137154,
  lng: 11.575972,
  homepage: 'https://example-restaurant.de',
  menu_url: 'https://example-restaurant.de/speisekarte',
  max_seats: 8,
  host_counts_as_seat: true,
  status: 'upcoming'
};

async function addEvent() {
  try {
    console.log('🍽️ Adding new event to Münchner Gastrotour...');
    console.log('📅 Event:', newEvent.name);
    console.log('📍 Location:', newEvent.address);
    console.log('🗓️ Date:', new Date(newEvent.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin'
    }));

    // Insert the event into the database
    const { data, error } = await supabase
      .from('events')
      .insert([newEvent])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting event:', error);
      process.exit(1);
    }

    console.log('✅ Event added successfully!');
    console.log('🆔 Event ID:', data.id);
    console.log('🎯 Max Seats:', data.max_seats);
    console.log('📊 Status:', data.status);
    
    // Verify the event was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('events')
      .select('*')
      .eq('id', data.id)
      .single();

    if (verifyError) {
      console.warn('⚠️ Warning: Could not verify event creation:', verifyError);
    } else {
      console.log('✅ Event verified in database');
    }

    console.log('\n🌐 You can now view the event at:');
    console.log(`   https://nextjs-app-phi-ivory.vercel.app/events`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Add additional events if needed
const additionalEvents = [
  {
    name: 'Bayerische Brotzeit im Biergarten',
    description: 'Traditionelle bayerische Küche unter freiem Himmel. Ein gemütlicher Abend mit Weißwurst, Brezn und frischem Bier im authentischen Münchner Biergarten.',
    date: '2025-11-08T18:30:00+01:00', // November 8, 2025, 6:30 PM CET
    address: 'Augustiner-Bräu München, Landsberger Str. 19, 80339 München',
    lat: 48.144920,
    lng: 11.545850,
    homepage: 'https://augustiner-braeu.de',
    menu_url: 'https://augustiner-braeu.de/speisekarte',
    max_seats: 10,
    host_counts_as_seat: true,
    status: 'upcoming'
  },
  {
    name: 'Asiatische Fusion Küche',
    description: 'Eine kulinarische Reise durch Asien mit modernen Interpretationen traditioneller Gerichte. Erleben Sie die Vielfalt der asiatischen Küche in stylischer Atmosphäre.',
    date: '2025-12-03T19:30:00+01:00', // December 3, 2025, 7:30 PM CET
    address: 'Maximilianstraße 15, 80539 München',
    lat: 48.139126,
    lng: 11.580438,
    homepage: 'https://asia-fusion-munich.de',
    menu_url: 'https://asia-fusion-munich.de/menu',
    max_seats: 6,
    host_counts_as_seat: true,
    status: 'upcoming'
  }
];

async function addMultipleEvents() {
  console.log('🍽️ Adding multiple events to Münchner Gastrotour...\n');
  
  // Add the main event first
  await addEvent();
  
  // Add additional events
  for (const [index, eventData] of additionalEvents.entries()) {
    console.log(`\n➕ Adding additional event ${index + 1}/${additionalEvents.length}:`);
    console.log('📅 Event:', eventData.name);
    console.log('🗓️ Date:', new Date(eventData.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin'
    }));

    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting additional event:', error);
      continue;
    }

    console.log('✅ Additional event added successfully!');
    console.log('🆔 Event ID:', data.id);
  }
  
  console.log('\n🎉 All events added successfully!');
  console.log('🌐 View all events at: https://nextjs-app-phi-ivory.vercel.app/events');
}

// Run the script
if (require.main === module) {
  // Check if user wants to add multiple events
  const args = process.argv.slice(2);
  if (args.includes('--multiple') || args.includes('-m')) {
    addMultipleEvents().catch(console.error);
  } else {
    addEvent().catch(console.error);
  }
}