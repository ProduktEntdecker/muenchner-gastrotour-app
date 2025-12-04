import { Resend } from 'resend'

/**
 * Email Configuration for Münchner Gastrotour
 *
 * DOMAIN STRATEGY (IMPORTANT - DON'T FORGET):
 * - Primary domain: muenchner-gastrotour.de (for German market trust & SEO)
 * - Secondary domain: muenchner-gastrotour.com (forwards to .de)
 * - Email infrastructure: Set up on .de domain only
 *
 * CURRENT STATUS:
 * - Transactional emails: Sent via Resend from verified domain
 * - Domain in Resend: muenchner-gastrotour.de (ASCII/Punycode version)
 * - .com domain: Email forwarding active in checkdomain.de
 *
 * DNS RECORDS REQUIRED (added to muenchner-gastrotour.de at checkdomain.de):
 * - MX record: send -> feedback-smtp.eu-west-1.amazonses.com
 * - TXT record: send -> v=spf1 include:amazonses...
 * - TXT record: resend._domainkey -> p=MIGfMA0GCSq...
 * - TXT record: _dmarc -> v=DMARC1; p=none;
 */
const resend = new Resend(process.env.RESEND_API_KEY || 'test')

// FROM address should be noreply@muenchner-gastrotour.de once domain is verified
// Currently using Resend sandbox domain during setup
const fromEmail = process.env.EMAIL_FROM || 'Münchner Gastrotour <onboarding@resend.dev>'

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export async function sendMagicLinkEmail(email: string, token: string) {
  const magicLink = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(token)}`

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      // IMPORTANT: Reply-To uses .de domain (our primary domain)
      // This ensures replies go to the correct domain even if FROM uses Resend sandbox
      replyTo: 'info@muenchner-gastrotour.de',
      subject: 'Dein Login-Link für Münchner Gastrotour',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #ff7a1a;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
              }
              .footer { margin-top: 40px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Hallo! 👋</h2>
              <p>Klicke auf den Button unten, um dich bei Münchner Gastrotour anzumelden:</p>
              <a href="${magicLink}" class="button">Jetzt anmelden</a>
              <p>Oder kopiere diesen Link in deinen Browser:</p>
              <p style="word-break: break-all; color: #0066cc;">${magicLink}</p>
              <div class="footer">
                <p>Dieser Link ist 24 Stunden gültig.</p>
                <p>Falls du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export async function sendBookingConfirmation(
  email: string,
  userName: string,
  eventName: string,
  eventDate: Date,
  eventAddress: string,
  status: 'confirmed' | 'waitlist' = 'confirmed',
  isPromotion: boolean = false
) {
  let subject: string;
  let title: string;
  let message: string;
  let statusColor = '#ff7a1a';

  if (isPromotion) {
    subject = `🎉 Du bist dabei! ${eventName}`;
    title = 'Großartige Neuigkeiten! 🎉';
    message = 'Ein Platz ist frei geworden und du bist von der Warteliste nachgerückt! <strong>Deine Buchung ist nun bestätigt.</strong>';
    statusColor = '#28a745';
  } else if (status === 'confirmed') {
    subject = `Reservierung bestätigt: ${eventName}`;
    title = `Hallo ${userName}! 🎉`;
    message = `Deine Reservierung für <strong>${eventName}</strong> ist bestätigt!`;
  } else {
    subject = `Warteliste: ${eventName}`;
    title = `Hallo ${userName}! ⏳`;
    message = `Die Veranstaltung <strong>${eventName}</strong> ist leider schon ausgebucht. <strong>Du wurdest auf die Warteliste gesetzt.</strong> Falls ein Platz frei wird, informieren wir dich sofort per E-Mail.`;
    statusColor = '#ffc107';
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      // IMPORTANT: Reply-To uses .de domain (our primary domain) for customer support
      replyTo: 'info@muenchner-gastrotour.de',
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .event-box {
                background: #f8f9fa;
                border-left: 4px solid ${statusColor};
                padding: 15px;
                margin: 20px 0;
              }
              .detail { margin: 8px 0; }
              .footer { margin-top: 40px; font-size: 12px; color: #666; }
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                background: ${statusColor};
                color: white;
                border-radius: 4px;
                font-weight: bold;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${title}</h2>
              <p>${message}</p>

              ${status === 'waitlist' ? '' : '<div class="status-badge">✓ Bestätigt</div>'}

              <div class="event-box">
                <div class="detail">📅 <strong>Datum:</strong> ${eventDate.toLocaleString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Berlin'
                })}</div>
                <div class="detail">📍 <strong>Adresse:</strong> ${eventAddress}</div>
              </div>

              <p>${status === 'waitlist' ? 'Wir halten dich auf dem Laufenden!' : 'Wir freuen uns auf dich!'}</p>

              <div class="footer">
                ${status === 'confirmed' ? '<p>Du erhältst 2 Tage vor dem Event eine Erinnerung.</p>' : ''}
                <p>Falls du ${status === 'waitlist' ? 'von der Warteliste genommen werden möchtest' : 'nicht teilnehmen kannst'}, sage bitte rechtzeitig ab.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Booking confirmation email error:', error)
    return { success: false, error }
  }
}

export async function sendEventReminder(
  email: string,
  userName: string,
  eventName: string,
  eventDate: Date,
  eventAddress: string,
  attendees: string[]
) {
  const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      // IMPORTANT: Reply-To uses .de domain (our primary domain) for customer support
      replyTo: 'info@muenchner-gastrotour.de',
      subject: `Erinnerung: ${eventName} ${daysUntil === 1 ? 'morgen' : `in ${daysUntil} Tagen`}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .event-box {
                background: #f8f9fa;
                border-left: 4px solid #ff7a1a;
                padding: 15px;
                margin: 20px 0;
              }
              .detail { margin: 8px 0; }
              .attendees {
                background: white;
                padding: 10px;
                border-radius: 8px;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Erinnerung: ${eventName} ${daysUntil === 1 ? 'morgen' : `in ${daysUntil} Tagen`}! ⏰</h2>

              <div class="event-box">
                <div class="detail">📅 <strong>${eventDate.toLocaleString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Berlin'
                })}</strong></div>
                <div class="detail">📍 <strong>${eventAddress}</strong></div>

                <div class="attendees">
                  <strong>Dabei sind:</strong><br>
                  ${attendees.join(', ')}
                </div>
              </div>

              <p>Wir freuen uns auf dich!</p>
            </div>
          </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Event reminder email error:', error)
    return { success: false, error }
  }
}