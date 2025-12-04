const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const events = [
    {
        name: 'Gandl - Feinkost, Speisen & Bar',
        description: 'Genießen Sie gehobene Küche am schönsten Platz im Lehel. Das Gandl am St.-Anna-Platz bietet eine exquisite Mischung aus Feinkost, Restaurant und Bar mit sonnigen Terrassen.',
        date: '2025-01-14T19:00:00+01:00',
        address: 'St.-Anna-Platz 1, 80538 München',
        homepage: 'https://www.gandl.de/',
        menu_url: 'https://www.gandl.de/',
        max_seats: 8,
        status: 'upcoming'
    },
    {
        name: 'Monti Monaco - Italienisches Lifestyle-Restaurant',
        description: 'Benvenuti! Modernes italienisches Lifestyle-Konzept direkt an der Isar. Erleben Sie Dolce Vita mit Passion, Amore und der Liebe zum guten Leben - Essen, Trinken und echte Begegnungen.',
        date: '2025-02-11T19:00:00+01:00',
        address: 'Steinsdorfstraße 22, 80538 München',
        homepage: 'https://montimonaco.de/',
        menu_url: 'https://montimonaco.de/menu/',
        max_seats: 8,
        status: 'upcoming'
    },
    {
        name: 'franz. - Deine Genuss-Oase',
        description: 'Bistro-Bar mit Herz! Ob Glas Wein nach der Arbeit, Aperitif oder gemütliches Abendessen - bei franz. gibt es sorgfältig ausgewählte Weine, frische Bistrogerichte und wechselnde 3-Gang-Menüs.',
        date: '2025-03-11T19:00:00+01:00',
        address: 'Valleystraße 19, 81371 München',
        homepage: 'https://www.franz.bar/',
        menu_url: 'https://www.franz.bar/wp-content/uploads/go-x/u/d6236918-f713-4503-a5f9-3851a28cd6f4/Karte-gesamt-04.11.25.pdf',
        max_seats: 8,
        status: 'upcoming'
    },
    {
        name: 'Gufo Restaurant - Italienische Küche in Giesing',
        description: 'Authentisches italienisches Restaurant in München-Giesing. Genießen Sie klassische italienische Gerichte wie Vongole, Crudo vom Zander und Parmigiana in entspannter Atmosphäre.',
        date: '2025-04-08T19:00:00+02:00',
        address: 'Zugspitzstraße 10, 81541 München',
        homepage: 'https://gufo-restaurant.de/',
        menu_url: 'https://gufo-restaurant.de/speisekarte/',
        max_seats: 8,
        status: 'upcoming'
    }
];

async function insertEvents() {
    console.log('🍽️  Inserting events into Supabase...\n');

    for (const event of events) {
        const { data, error } = await supabase
            .from('events')
            .insert([event])
            .select();

        if (error) {
            console.error(`❌ Error inserting ${event.name}:`, error.message);
        } else {
            console.log(`✅ Inserted: ${event.name} - ${new Date(event.date).toLocaleDateString('de-DE')}`);
        }
    }

    console.log('\n🎉 All events inserted successfully!');
}

insertEvents();
