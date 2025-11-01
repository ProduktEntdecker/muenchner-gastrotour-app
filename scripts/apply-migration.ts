import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/007_add_cuisine_type.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('Applying migration: 007_add_cuisine_type.sql');
    console.log('SQL:', migrationSQL);

    // Note: We can't run DDL statements through the Supabase client directly
    // You need to run this in the Supabase Dashboard SQL Editor
    console.log('\n⚠️  Please run the above SQL in Supabase Dashboard:');
    console.log('1. Go to https://ppypwhnxgphraleorioq.supabase.co/project/ppypwhnxgphraleorioq/sql');
    console.log('2. Paste the SQL above');
    console.log('3. Click "Run"\n');

    // Verify the column doesn't exist yet
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying events:', error);
    } else {
      console.log('Sample event structure:', Object.keys(data[0] || {}));
      if (data[0] && 'cuisine_type' in data[0]) {
        console.log('✅ cuisine_type column already exists!');
      } else {
        console.log('⏳ cuisine_type column not yet added');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyMigration();
