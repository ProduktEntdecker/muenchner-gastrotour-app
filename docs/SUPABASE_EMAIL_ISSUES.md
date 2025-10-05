# Supabase Email Bouncing Issue Resolution

## Problem
Supabase has detected a high rate of bounced emails from the transactional emails system and may temporarily restrict email sending privileges if not resolved.

## Root Cause
The bouncing is likely caused by:
1. Testing with invalid/non-existent email addresses like `test@gmail.com`, `debug-test@gmail.com`, etc.
2. Using temporary or fake email addresses during development
3. Not using proper email validation in testing workflows

## Immediate Actions Taken

### 1. Fixed Email Validation Logic
- ✅ Identified that Supabase returns "Email address X is invalid" for duplicate emails
- ✅ Updated error handling to properly catch both "already registered" and "invalid email" scenarios
- ✅ Now returns consistent German error messages to users

### 2. Improved Input Validation
- ✅ Enhanced email normalization and validation using RFC-compliant regex
- ✅ Added proper password strength validation (12+ chars, uppercase, lowercase, numbers, special chars)
- ✅ Implemented input sanitization for names and other fields

## Recommended Solutions

### Option 1: Set up Custom SMTP Provider (Recommended)
Use a dedicated email service like Resend, SendGrid, or AWS SES:

```typescript
// Example with Resend (already configured in lib/email.ts)
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  await resend.emails.send({
    from: 'noreply@muenchner-gastrotour.de',
    to: email,
    subject: 'Bestätige deine E-Mail-Adresse',
    html: `<p>Klicke <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}">hier</a> um deine E-Mail zu bestätigen.</p>`
  })
}
```

### Option 2: Use Test Email Addresses
For development, use real email addresses that you control:

```javascript
// Good: Use your own email addresses for testing
const TEST_EMAILS = [
  'your-email+test1@gmail.com',
  'your-email+test2@gmail.com', 
  'your-email+dev@gmail.com'
]

// Bad: Using fake/non-existent emails
const BAD_EMAILS = [
  'test@gmail.com',
  'fake@example.com', 
  'nonexistent@test.com'
]
```

### Option 3: Use Dedicated Testing Tools
- **Mailtrap.io**: Email testing service with fake inbox
- **MailHog**: Local email testing server
- **Ethereal Email**: Fake SMTP service for testing

## Environment Configuration

Add these environment variables:

```bash
# For custom SMTP (if using Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@muenchner-gastrotour.de
ADMIN_EMAIL=admin@muenchner-gastrotour.de

# For testing
TEST_EMAIL_PROVIDER=resend|mailtrap|ethereal
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
```

## Testing Best Practices

### 1. Use Valid Email Addresses
```typescript
// Development testing
const validTestEmail = 'your-email+test@gmail.com'

// Production testing  
const realUserEmail = 'actual.user@company.com'
```

### 2. Implement Email Verification Testing
```typescript
// Test email verification flow
describe('Email Verification', () => {
  it('should send verification email to valid address', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'your-email+test@gmail.com',
        name: 'Test User',
        password: 'SecurePassword123!'
      })
    })
    
    expect(response.status).toBe(200)
    // Check email was sent (using testing service)
  })
})
```

### 3. Monitor Email Delivery
- Track bounce rates in your email service dashboard
- Set up alerts for high bounce rates
- Regularly clean up invalid email addresses from your database

## Supabase Configuration

If continuing with Supabase Auth:
1. Configure custom SMTP in Supabase dashboard
2. Set up proper email templates
3. Configure email rate limiting appropriately
4. Monitor email delivery metrics

## Migration Plan

1. **Immediate** (Done):
   - ✅ Fix duplicate email error handling
   - ✅ Stop using fake test emails in development

2. **Short-term** (Next 1-2 days):
   - [ ] Set up Resend or another SMTP provider
   - [ ] Configure custom email templates
   - [ ] Update all test cases to use valid email addresses

3. **Medium-term** (Next week):
   - [ ] Implement email delivery monitoring
   - [ ] Set up proper development/staging email testing
   - [ ] Document email testing procedures for the team

## Monitoring

Track these metrics:
- Email bounce rate (should be < 2%)
- Email delivery rate (should be > 95%)
- User email confirmation rate
- Email provider reputation score

## Support Contact

If email sending remains restricted, contact Supabase support with:
- Details of remediation steps taken
- Proof of SMTP provider setup
- Updated testing procedures documentation