const fs = require('fs');
const path = require('path');

// The password from user
const rawPassword = 'fzh!CPJ.jxr6hzy-rvh';
const encodedPassword = encodeURIComponent(rawPassword);

console.log('Raw password:', rawPassword);
console.log('Encoded password:', encodedPassword);

const envPath = path.join(__dirname, '..', '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace the password in both URLs
envContent = envContent.replace(
    /postgresql:\/\/postgres\.ppypwhnxgphraleorioq:[^@]+@/g,
    `postgresql://postgres.ppypwhnxgphraleorioq:${encodedPassword}@`
);

fs.writeFileSync(envPath, envContent);
console.log('✅ Updated .env.local with URL-encoded password');
