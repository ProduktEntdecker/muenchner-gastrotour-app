#!/usr/bin/env tsx

/**
 * Script to seed events table with test data
 * Usage: tsx scripts/seed-events.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const testEvents = [
  {
    name: 'Hofbräuhaus München',
    description: 'Traditional Bavarian beer hall experience with classic dishes and live music',
    date: '2025-10-15T19:00:00+02:00',
    address: 'Platzl 9, 80331 München',
    lat: 48.1374300,
    lng: 11.5796900,
    homepage: 'https://www.hofbraeuhaus.de',
    menu_url: 'https://www.hofbraeuhaus.de/en/food-beverage.html',
    max_seats: 8,
    status: 'upcoming'
  },
  {
    name: 'Augustiner-Bräustuben',
    description: 'Authentic Munich brewery restaurant with beer garden atmosphere',
    date: '2025-10-22T18:30:00+02:00',
    address: 'Landsberger Str. 19, 80339 München',
    lat: 48.1351200,
    lng: 11.5430800,
    homepage: 'https://www.augustiner-braeu.de',
    menu_url: null,
    max_seats: 8,
    status: 'upcoming'
  },
  {
    name: 'Viktualienmarkt Food Tour',
    description: 'Exploring traditional Bavarian delicacies at Munich\'s famous food market',
    date: '2025-11-05T12:00:00+01:00',
    address: 'Viktualienmarkt 3, 80331 München',
    lat: 48.1351000,
    lng: 11.5762200,
    homepage: 'https://www.muenchen.de/sehenswuerdigkeiten/orte/viktualienmarkt',
    menu_url: null,
    max_seats: 8,
    status: 'upcoming'
  },
  {
    name: 'Spatzenhaus am Gärtnerplatz',
    description: 'Cozy restaurant serving modern Bavarian cuisine near Gärtnerplatz',
    date: '2025-11-12T19:30:00+01:00',
    address: 'Gärtnerpl. 3, 80469 München',
    lat: 48.1326400,
    lng: 11.5722500,
    homepage: 'https://www.spatzenhaus.de',
    menu_url: 'https://www.spatzenhaus.de/speisekarte',
    max_seats: 8,
    status: 'upcoming'
  },
  {
    name: 'Ratskeller München',
    description: 'Historic cellar restaurant in Munich\'s New Town Hall with traditional atmosphere',
    date: '2025-11-20T18:00:00+01:00',
    address: 'Marienplatz 8, 80331 München',
    lat: 48.1374100,
    lng: 11.5754900,
    homepage: 'https://www.ratskeller.com',
    menu_url: 'https://www.ratskeller.com/speisekarte',
    max_seats: 8,
    status: 'upcoming'
  }
]

async function seedEvents() {
  console.log('🌱 Seeding events table...\n')

  try {
    // First, delete existing test events to avoid duplicates
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.warn('⚠️  Could not clear existing events:', deleteError.message)
    } else {
      console.log('🗑️  Cleared existing events')
    }

    // Insert new test events
    const { data, error } = await supabase
      .from('events')
      .insert(testEvents)
      .select()

    if (error) {
      console.error('❌ Error seeding events:', error.message)
      process.exit(1)
    }

    console.log(`✅ Successfully seeded ${data?.length} events!\n`)

    // Display seeded events
    data?.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`)
      console.log(`   📅 ${new Date(event.date).toLocaleDateString('de-DE', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`)
      console.log(`   📍 ${event.address}`)
      console.log(`   💺 ${event.max_seats} seats available`)
      console.log(`   🔗 ${event.homepage || 'No website'}\n`)
    })

    console.log('🎉 Seeding complete!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedEvents()
