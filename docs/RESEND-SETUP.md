# Resend Email Configuration

## Overview
The Münchner Gastrotour app uses Resend for transactional emails (magic links, booking confirmations, reminders).

## API Key Management

### 1Password Integration
The Resend API key is securely stored in 1Password:
- **Vault**: Private
- **Item**: MünchenGastroTour - ResendAPI - App - dev
- **Reference**: `op://Private/gxry3kgmb7gqupzzvyzngcrjn4/Resend_API_Key`

### Accessing the API Key

#### Option 1: Direct Access (Development)
```bash
# Sign in to 1Password CLI
eval $(op signin)

# Get the API key
op read "op://Private/gxry3kgmb7gqupzzvyzngcrjn4/Resend_API_Key"
```

#### Option 2: Environment Injection (Recommended)
```bash
# Use the .env.1password file with automatic injection
op run --env-file=.env.1password -- npm run dev
```

## Current Configuration

### Sender Domain
Currently using Resend's test domain:
- **From**: `Münchner Gastrotour <onboarding@resend.dev>`

### Production Setup (Future)
To use your own domain:
1. Add domain in Resend dashboard
2. Configure DNS records (SPF, DKIM, DMARC)
3. Update `EMAIL_FROM` in `.env`

## Email Templates

### Magic Link Login
- Sent when users request passwordless login
- Valid for 24 hours
- Contains secure token link

### Booking Confirmation
- Sent immediately after booking
- Includes event details and attendee count
- German language

### Event Reminders
- 2 days before: Reminder with attendee list
- Timezone: Europe/Berlin

## Usage Limits

### Free Tier
- **Daily**: 100 emails
- **Monthly**: 3,000 emails
- **Rate Limit**: 10 requests/second

For 60 users with monthly events, free tier is sufficient:
- Magic links: ~60/month
- Confirmations: ~8/event = ~8/month
- Reminders: ~8/event = ~8/month
- **Total**: ~76 emails/month (well under 3,000 limit)

## Testing

### Test Script
```bash
# Run the test email script
node test-email.js
```

### Verify in Dashboard
Check email status at: https://resend.com/emails

## Troubleshooting

### Common Issues

1. **"From address must be a verified domain"**
   - Use `onboarding@resend.dev` for testing
   - Or verify your domain in Resend dashboard

2. **Email not received**
   - Check spam folder
   - Verify API key is correct
   - Check Resend dashboard for errors

3. **Rate limit exceeded**
   - Free tier: 10 requests/second
   - Implement rate limiting in production

## Security Notes

- Never commit API keys to git
- Use 1Password CLI for local development
- Use environment variables in production (Vercel)
- Rotate API keys regularly

## Links

- **Resend Dashboard**: https://resend.com
- **API Documentation**: https://resend.com/docs
- **1Password CLI**: https://developer.1password.com/docs/cli/