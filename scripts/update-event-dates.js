const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Update events to 2026 (2nd Tuesday of each month)
const updates = [
    { name: 'Gandl - Feinkost, Speisen & Bar', newDate: '2026-01-13T19:00:00+01:00' },
    { name: 'Monti Monaco - Italienisches Lifestyle-Restaurant', newDate: '2026-02-10T19:00:00+01:00' },
    { name: 'franz. - Deine Genuss-Oase', newDate: '2026-03-10T19:00:00+01:00' },
    { name: 'Gufo Restaurant - Italienische Küche in Giesing', newDate: '2026-04-14T19:00:00+02:00' }
];

async function updateEvents() {
    console.log('📅 Updating events to 2026...\n');

    for (const update of updates) {
        const { data, error } = await supabase
            .from('events')
            .update({ date: update.newDate })
            .eq('name', update.name)
            .select();

        if (error) {
            console.error(`❌ Error updating ${update.name}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`✅ Updated: ${update.name} → ${new Date(update.newDate).toLocaleDateString('de-DE')}`);
        } else {
            console.log(`⚠️  Not found: ${update.name}`);
        }
    }

    console.log('\n🎉 Events updated!');
}

updateEvents();
