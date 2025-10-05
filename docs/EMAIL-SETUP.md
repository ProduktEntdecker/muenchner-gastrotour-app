# Email Configuration for Münchner Gastrotour

> **📜 Important**: See [DOMAIN-STRATEGY.md](./DOMAIN-STRATEGY.md) for comprehensive domain and email strategy documentation.

## Domain Strategy Summary

**Primary Domain**: `münchner-gastrotour.de` (German market focus)  
**Secondary Domain**: `münchner-gastrotour.com` (forwards to .de)  
**Email Strategy**: Transactional emails on .de, forwarding on .com  

## Domain Email Setup

### Email Forwarding (Active)
Domain emails are forwarded to personal inbox via checkdomain.de:

| Email Address | Purpose | Forwards To |
|---------------|---------|-------------|
| `noreply@muenchner-gastrotour.de` | System emails | [Your personal email] |
| `info@muenchner-gastrotour.de` | General inquiries | [Your personal email] |
| `admin@muenchner-gastrotour.de` | Admin notifications | [Your personal email] |
| `hello@muenchner-gastrotour.de` | Friendly contact | [Your personal email] |

**Note:** These are receive-only addresses. Replies should come from your personal email.

## Transactional Emails (App)

### Current Setup
The app uses **Resend** for sending automated emails:
- **From Address:** `Münchner Gastrotour <onboarding@resend.dev>` (will change to noreply@münchner-gastrotour.de)
- **Service:** Resend (Free tier: 100 emails/day)
- **API Key:** Stored in 1Password
- **Domain Status**: Setting up münchner-gastrotour.de verification

### Domain Verification Process

⚠️ **Critical**: The domain `münchner-gastrotour.de` contains non-ASCII characters and must be converted to Punycode:

```bash
# Convert domain to ASCII format for email services
node -e "console.log(require('url').domainToASCII('münchner-gastrotour.de'))"
# Output: xn--mnchner-gastrotour-m6b.de
```

**Add to Resend**: `xn--mnchner-gastrotour-m6b.de` (NOT the original domain)

### Required DNS Records

Add these records to `münchner-gastrotour.de` at checkdomain.de:

| Type | Host/Name | Value | Priority |
|------|-----------|-------|----------|
| MX | send | feedback-smtp.eu-west-1.amazonses.com | 10 |
| TXT | send | v=spf1 include:amazonses.com ~all | - |
| TXT | resend._domainkey | p=MIGfMA0GCSq... (from Resend dashboard) | - |
| TXT | _dmarc | v=DMARC1; p=none; | - |

🔄 **DNS Propagation**: Allow 24-48 hours for changes to take effect

### Email Types Sent
1. **Magic Link Login** - Passwordless authentication
2. **Booking Confirmation** - When user reserves a seat
3. **Event Reminder** - 2 days before event

## How It Works Together

```
User Action in App
    ↓
Resend API sends email
FROM: onboarding@resend.dev
TO: user@example.com
    ↓
User receives email
    ↓
If user replies → Goes to spam (no-reply address)
```

For support:
- Users should email `info@muenchner-gastrotour.de`
- You receive it in your personal inbox
- You reply from your personal email

## Implementation Status

### ✅ Current Status
- [x] Resend account active
- [x] Domain converted to Punycode: `xn--mnchner-gastrotour-m6b.de`
- [x] Domain added to Resend dashboard
- [ ] DNS records added to checkdomain.de
- [ ] Domain verification completed
- [ ] EMAIL_FROM environment variable updated

### 🎡 Next Steps
1. **Add DNS Records**: Log into checkdomain.de and add the DNS records above
2. **Verify Domain**: Check Resend dashboard for verification status
3. **Update Environment**: Set `EMAIL_FROM="Münchner Gastrotour <noreply@münchner-gastrotour.de>"`
4. **Test Email Delivery**: Send test emails to verify configuration

## Legacy Setup (Pre-Domain Verification)

### Option A: Verify Domain in Resend (✅ In Progress)
This allows sending from `noreply@muenchner-gastrotour.de`:
1. ✅ Add DNS records at checkdomain.de (see above)
2. ✅ Verify in Resend dashboard
3. ⚡ Update `EMAIL_FROM` in `.env`

### Option B: Add "Reply-To" Header
Modify email templates to include:
```typescript
await resend.emails.send({
  from: 'Münchner Gastrotour <onboarding@resend.dev>',
  to: userEmail,
  replyTo: 'info@muenchner-gastrotour.de',  // Replies go here
  subject: '...',
  html: '...'
})
```

## Contact Information for Users

Add to website footer:
- **General Inquiries:** info@muenchner-gastrotour.de
- **Support:** hello@muenchner-gastrotour.de

**Important:** Don't use `noreply@` for user-facing communication!