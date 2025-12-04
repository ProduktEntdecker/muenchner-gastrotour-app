const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log('Testing connection to:', connectionString.split('@')[1]);

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        await client.connect();
        console.log('✅ Connected successfully');
        const res = await client.query('SELECT version()');
        console.log('Version:', res.rows[0].version);
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
}

test();
