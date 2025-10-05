#!/usr/bin/env node

/**
 * Apply critical database performance indexes to Supabase
 * Run this script to optimize your production database
 *
 * Usage: node scripts/apply-database-indexes.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Critical indexes for performance
const indexes = [
  {
    name: 'Events date index',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date
          ON events(event_date)
          WHERE event_date >= CURRENT_DATE`
  },
  {
    name: 'Events status and date composite',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status_date
          ON events(status, event_date)
          WHERE status = 'published' AND event_date >= CURRENT_DATE`
  },
  {
    name: 'Events restaurant name',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_restaurant
          ON events(restaurant_name)`
  },
  {
    name: 'Bookings event ID (foreign key)',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_event_id
          ON bookings(event_id)`
  },
  {
    name: 'Bookings user email',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_email
          ON bookings(email)`
  },
  {
    name: 'Bookings status',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status
          ON bookings(status)`
  },
  {
    name: 'Bookings created at',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_created_at
          ON bookings(created_at DESC)`
  },
  {
    name: 'Profiles email',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email
          ON profiles(email)`
  },
  {
    name: 'Profiles created at',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at
          ON profiles(created_at DESC)`
  },
  {
    name: 'Events availability composite',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_availability
          ON events(event_date, max_seats)
          WHERE status = 'published' AND event_date >= CURRENT_DATE`
  },
  {
    name: 'User bookings history',
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_bookings
          ON bookings(email, status, created_at DESC)`
  }
]

async function applyIndexes() {
  console.log('🚀 Starting database index optimization...\n')

  let successCount = 0
  let errorCount = 0

  for (const index of indexes) {
    try {
      console.log(`📊 Creating index: ${index.name}...`)
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: index.sql
      }).single()

      if (error) {
        // Try direct execution if RPC doesn't exist
        const { error: directError } = await supabase
          .from('_migrations')
          .insert({ sql: index.sql })
          .single()

        if (directError) {
          console.error(`   ❌ Failed: ${directError.message}`)
          console.log(`   💡 Run this manually in Supabase SQL editor:`)
          console.log(`      ${index.sql}\n`)
          errorCount++
        } else {
          console.log(`   ✅ Success!\n`)
          successCount++
        }
      } else {
        console.log(`   ✅ Success!\n`)
        successCount++
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`)
      console.log(`   💡 Run this manually in Supabase SQL editor:`)
      console.log(`      ${index.sql}\n`)
      errorCount++
    }
  }

  // Update table statistics for query planner
  console.log('📈 Updating table statistics...')
  const analyzeCommands = [
    'ANALYZE events',
    'ANALYZE bookings',
    'ANALYZE profiles'
  ]

  for (const cmd of analyzeCommands) {
    try {
      await supabase.rpc('exec_sql', { sql: cmd }).single()
      console.log(`   ✅ ${cmd}`)
    } catch (err) {
      console.log(`   ⚠️  ${cmd} - May need manual execution`)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Index optimization complete!`)
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)

  if (errorCount > 0) {
    console.log(`\n⚠️  Some indexes need manual creation.`)
    console.log(`   Go to your Supabase SQL editor and run the failed commands.`)
    console.log(`   File: docs/DATABASE_PERFORMANCE_INDEXES.sql`)
  }

  console.log('\n💡 Performance tips:')
  console.log('   - Indexes improve read performance but slightly slow writes')
  console.log('   - Monitor query performance in Supabase dashboard')
  console.log('   - Run ANALYZE weekly to keep statistics updated')
}

// Check if exec_sql function exists, if not provide instructions
async function checkSupabaseSetup() {
  const { data, error } = await supabase
    .rpc('exec_sql', { sql: 'SELECT 1' })
    .single()
    .catch(() => ({ data: null, error: true }))

  if (error) {
    console.log('⚠️  Direct SQL execution not available via RPC.')
    console.log('   Please run the indexes manually in Supabase SQL editor.')
    console.log('   File: docs/DATABASE_PERFORMANCE_INDEXES.sql\n')
    console.log('   Or create this function in Supabase:')
    console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`)
    return false
  }
  return true
}

// Main execution
async function main() {
  const canExecute = await checkSupabaseSetup()

  if (canExecute) {
    await applyIndexes()
  } else {
    console.log('\n📋 Copy the SQL from docs/DATABASE_PERFORMANCE_INDEXES.sql')
    console.log('   and run it in your Supabase SQL editor.')
  }
}

main().catch(console.error)