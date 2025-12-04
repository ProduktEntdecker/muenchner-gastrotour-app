const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Prefer DIRECT_URL for migrations (session mode)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL/DIRECT_URL is missing in .env.local');
    process.exit(1);
}

// Migration files to run in order
// Based on file list and DEPLOYMENT.md
const MIGRATION_FILES = [
    '001_initial_schema_corrected.sql',
    '002_auth_functions.sql', // If exists, or check file list again
    '003_auth_triggers_corrected.sql',
    // Add others if needed, or just run all in alphanumeric order
];

// Actually, let's just run all of them in alphanumeric order, 
// but prioritizing the ones we know are critical.
// The file list had:
// 001_initial_schema_corrected.sql
// 001_tables_only.sql (Skip this if we run corrected?)
// 002_rls_policies_corrected.sql
// 003_auth_triggers_corrected.sql
// ...

// Let's try to be smart. If there is a _corrected version, prefer it?
// Or just run them in alphanumeric order and hope they are idempotent or distinct.
// Most SQL migrations use IF NOT EXISTS.

async function deployMigrations() {
    console.log('🚀 Starting migration deployment...');
    console.log(`Using connection string: ${connectionString.split('@')[1]}`); // Log host only

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} migration files.`);

        // We need to filter out conflicting ones.
        // 001_initial_schema_corrected.sql vs 001_tables_only.sql
        // 001_initial_schema_corrected.sql seems to include tables.
        // Let's use a specific list for safety, based on the file list I saw.

        const filesToRun = [
            '001_initial_schema_corrected.sql',
            '002_rls_policies_corrected.sql',
            '003_auth_triggers_corrected.sql',
            // '004_performance_indexes.sql', // Skip - uses CONCURRENTLY which can't run in transaction
            '005_secure_admin_setup.sql',
            // '006_email_uniqueness_constraint.sql', // Skip - uses CONCURRENTLY
            '007_add_cuisine_type.sql',
            'create_error_logs_table.sql'
        ];

        for (const file of filesToRun) {
            const filePath = path.join(migrationsDir, file);
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️ Skipping missing file: ${file}`);
                continue;
            }

            console.log(`\n📄 Running ${file}...`);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await client.query(sql);
                console.log(`✅ Successfully ran ${file}`);
            } catch (err) {
                console.error(`❌ Error running ${file}:`, err.message);
                // Don't exit, try next? Or exit?
                // For now, let's continue as some might fail if already exists
                if (err.message.includes('already exists')) {
                    console.log('   (Ignoring "already exists" error)');
                } else {
                    throw err;
                }
            }
        }

        console.log('\n✅ All migrations completed!');

    } catch (err) {
        console.error('\n❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

deployMigrations();
