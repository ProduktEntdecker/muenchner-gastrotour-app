#!/usr/bin/env tsx

/**
 * Script to run Supabase migrations locally
 * Usage: tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running events table migration...\n')

  try {
    // Read the migration file
    const migrationPath = join(
      process.cwd(),
      '..',
      '..',
      'supabase',
      'migrations',
      '20251005_create_events_table.sql'
    )

    const sql = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file:', migrationPath)
    console.log('📏 SQL size:', sql.length, 'bytes\n')

    // Note: Supabase JS client doesn't support raw SQL execution
    // You need to run this in the Supabase Dashboard SQL Editor
    console.log('⚠️  Supabase JS client cannot execute raw SQL migrations.')
    console.log('📋 Please run this migration manually:\n')
    console.log('1. Go to: https://supabase.com/dashboard/project/ppypwhnxgphraleorioq/sql/new')
    console.log('2. Copy the SQL from: supabase/migrations/20251005_create_events_table.sql')
    console.log('3. Paste and run in the SQL editor\n')

    // Instead, let's verify if the table exists
    console.log('🔍 Checking if events table exists...\n')

    const { data, error } = await supabase
      .from('events')
      .select('id, name, date, status')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Events table does not exist yet')
        console.log('👉 Please run the migration in Supabase Dashboard SQL Editor')
      } else {
        console.error('❌ Error querying events:', error.message)
      }
      return
    }

    console.log('✅ Events table exists!')

    // Get all events
    const { data: allEvents, error: queryError } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (queryError) {
      console.error('❌ Error fetching events:', queryError.message)
      return
    }

    console.log(`📊 Found ${allEvents?.length || 0} events:\n`)

    allEvents?.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`)
      console.log(`   📅 ${new Date(event.date).toLocaleDateString('de-DE')}`)
      console.log(`   📍 ${event.address}`)
      console.log(`   💺 ${event.max_seats} seats`)
      console.log(`   ✨ Status: ${event.status}\n`)
    })

    console.log('✅ Migration verification complete!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

runMigration()
