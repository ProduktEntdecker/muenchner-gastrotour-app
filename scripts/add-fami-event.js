#!/usr/bin/env node

/**
 * Script to add the real FAMI restaurant event to Münchner Gastrotour
 * First cleans up any placeholder events, then adds the real event
 * Usage: node scripts/add-fami-event.js
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

// Real FAMI restaurant event data
const famiEvent = {
  name: 'FAMI Restaurant - Authentische italienische Küche',
  description: 'Entdecken Sie die authentische italienische Küche im FAMI Restaurant in München-Schwabing. Das gemütliche Restaurant bietet traditionelle italienische Gerichte mit frischen Zutaten - von klassischen Pizzas bis hin zu hausgemachten Pasta-Spezialitäten. Ein perfekter Ort für einen entspannten Abend mit echter italienischer Gastfreundschaft.',
  date: '2025-10-14T20:00:00+02:00', // October 14, 2025, 8:00 PM CEST
  address: 'Georg-Birk-Str. 10, 80797 München',
  lat: 48.1617, // Approximate coordinates for Georg-Birk-Str. 10, München
  lng: 11.5847,
  homepage: 'https://fami-restaurant.de/',
  menu_url: 'https://www.speisekarte.de/münchen/restaurant/fami_restaurant/speisekarte',
  max_seats: 7, // 8 total seats - 1 for host = 7 available for booking
  host_counts_as_seat: true,
  status: 'upcoming'
};

async function cleanupPlaceholderEvents() {
  console.log('🧹 Cleaning up placeholder events...');
  
  // Find and remove placeholder events
  const placeholderNames = [
    'Italienische Küche im Zentrum',
    'Bayerische Brotzeit im Biergarten', 
    'Asiatische Fusion Küche'
  ];
  
  for (const placeholderName of placeholderNames) {
    const { data: existingEvents, error: fetchError } = await supabase
      .from('events')
      .select('id, name')
      .eq('name', placeholderName);
      
    if (fetchError) {
      console.error(`⚠️ Error checking for placeholder "${placeholderName}":`, fetchError);
      continue;
    }
    
    if (existingEvents && existingEvents.length > 0) {
      console.log(`🗑️ Removing placeholder event: "${placeholderName}"`);
      
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('name', placeholderName);
        
      if (deleteError) {
        console.error(`❌ Error removing placeholder "${placeholderName}":`, deleteError);
      } else {
        console.log(`✅ Removed ${existingEvents.length} placeholder event(s): "${placeholderName}"`);
      }
    }
  }
}

async function addFamiEvent() {
  try {
    console.log('\n🍽️ Adding FAMI restaurant event to Münchner Gastrotour...');
    console.log('📅 Event:', famiEvent.name);
    console.log('📍 Location:', famiEvent.address);
    console.log('🗓️ Date:', new Date(famiEvent.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin'
    }));
    console.log('🌐 Website:', famiEvent.homepage);

    // Check if FAMI event already exists
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('id, name')
      .eq('name', famiEvent.name)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking for existing FAMI event:', checkError);
      return;
    }
    
    if (existingEvent) {
      console.log('ℹ️ FAMI event already exists with ID:', existingEvent.id);
      console.log('🌐 View event at: https://nextjs-app-phi-ivory.vercel.app/events');
      return;
    }

    // Insert the FAMI event into the database
    const { data, error } = await supabase
      .from('events')
      .insert([famiEvent])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting FAMI event:', error);
      process.exit(1);
    }

    console.log('✅ FAMI event added successfully!');
    console.log('🆔 Event ID:', data.id);
    console.log('🎯 Max Seats:', data.max_seats);
    console.log('📊 Status:', data.status);
    console.log('📅 Date:', new Date(data.date).toISOString());
    
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

    console.log('\n🌐 You can now view the FAMI event at:');
    console.log(`   https://nextjs-app-phi-ivory.vercel.app/events`);
    console.log('📋 Event details:');
    console.log(`   🍕 Cuisine: Authentic Italian`);
    console.log(`   🕐 Time: 8:00 PM`);
    console.log(`   👥 Available spots: ${data.max_seats} (+ 1 host = 8 total)`);
    console.log(`   📍 Location: Schwabing, München`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

async function main() {
  await cleanupPlaceholderEvents();
  await addFamiEvent();
  console.log('\n🎉 Setup complete! FAMI event is ready for booking.');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { addFamiEvent, cleanupPlaceholderEvents };