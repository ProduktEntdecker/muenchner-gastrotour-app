const { Resend } = require('resend');

// Load from .env.local
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  const testEmail = process.argv[2];

  if (!testEmail) {
    console.log('Usage: node scripts/test-resend.js your@email.com');
    process.exit(1);
  }

  console.log('Testing Resend with API key:', process.env.RESEND_API_KEY?.slice(0, 10) + '...');
  console.log('Sending to:', testEmail);

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Münchner Gastrotour <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Test E-Mail von Münchner Gastrotour',
      html: `
        <h2>Test erfolgreich!</h2>
        <p>Diese E-Mail bestätigt, dass Resend korrekt konfiguriert ist.</p>
        <p>Gesendet am: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
      `
    });

    console.log('E-Mail gesendet!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Fehler:', error.message);
    if (error.statusCode) {
      console.error('Status:', error.statusCode);
    }
  }
}

testEmail();
