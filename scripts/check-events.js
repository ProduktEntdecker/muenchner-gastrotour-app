const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEvents() {
    console.log('🔍 Checking events in database...\n');

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    console.log(`Found ${data.length} events:\n`);
    data.forEach((event, i) => {
        console.log(`${i + 1}. ${event.name}`);
        console.log(`   Date: ${event.date}`);
        console.log(`   Status: ${event.status}`);
        console.log(`   ID: ${event.id}\n`);
    });
}

checkEvents();
