const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envLocalPath)) {
    console.log('MISSING: .env.local file not found');
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));

const requiredKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'DATABASE_URL',
    'DIRECT_URL'
];

const missing = [];
const present = [];

requiredKeys.forEach(key => {
    if (!envConfig[key] || envConfig[key].includes('your-') || envConfig[key] === '') {
        missing.push(key);
    } else {
        present.push(key);
    }
});

if (missing.length > 0) {
    console.log('MISSING_KEYS:', missing.join(', '));
    console.log('PRESENT_KEYS:', present.join(', '));
} else {
    console.log('ALL_KEYS_PRESENT');
}
