# Domain & Email Strategy for Münchner Gastrotour

## Executive Summary

**Primary Domain**: `münchner-gastrotour.de`  
**Secondary Domain**: `münchner-gastrotour.com` (forwarded)  
**Email Infrastructure**: Hosted on .de domain only  

## Domain Strategy Decision

### Why .de as Primary Domain?

1. **Target Market Alignment**: German customers for Munich-based food tours
2. **Local Trust**: .de domains have higher credibility in Germany
3. **SEO Benefits**: Google.de prefers .de domains for German search results
4. **Email Deliverability**: German email providers trust .de domains more

### Domain Setup

| Domain | Purpose | Status | Configuration |
|--------|---------|--------|---------------|
| `münchner-gastrotour.de` | Primary website & email | Active | Main DNS at checkdomain.de |
| `münchner-gastrotour.com` | Brand protection | Forwarded | Redirects to .de domain |

## Email Infrastructure

### Current Setup (as of 2024)

```
┌─────────────────────────────────────┐
│           Email Flow                │
├─────────────────────────────────────┤
│                                     │
│  App Transactional Emails          │
│  ├─ FROM: Resend (sandbox/verified) │
│  ├─ TO: Users                       │
│  └─ REPLY-TO: info@münchner-gas...  │
│                                     │
│  Incoming Customer Emails           │
│  ├─ TO: info@münchner-gastrotour.de │
│  ├─ FORWARDED: Personal Gmail       │
│  └─ REPLY: From personal email      │
│                                     │
└─────────────────────────────────────┘
```

### Domain Registration & DNS

**Domain Registrar**: checkdomain.de  
**Primary DNS**: Managed at checkdomain.de  

#### .de Domain (Active Email)
- **Purpose**: Primary domain for all operations
- **Email**: Transactional emails via Resend
- **DNS Records**: See Resend Setup section below

#### .com Domain (Forwarding Only)
- **Purpose**: Brand protection and user convenience
- **Setup**: Domain forwarding to .de
- **Email Forwarding**: Active (forwards to personal email)

## Resend Email Service Setup

### Domain Verification Process

Since `münchner-gastrotour.de` contains non-ASCII characters (ü), it must be converted to Punycode for email services:

```bash
# Convert to ASCII/Punycode format
node -e "console.log(require('url').domainToASCII('münchner-gastrotour.de'))"
# Output: xn--mnchner-gastrotour-m6b.de
```

**Add to Resend Dashboard**: `xn--mnchner-gastrotour-m6b.de`

### Required DNS Records

Add these records to `münchner-gastrotour.de` at checkdomain.de:

#### DKIM & SPF (Required)
```dns
Type: MX
Host: send
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10

Type: TXT  
Host: send
Value: v=spf1 include:amazonses.com ~all

Type: TXT
Host: resend._domainkey  
Value: p=MIGfMA0GCSqGSIb3DQEBA... (full DKIM key from Resend)
```

#### DMARC (Recommended)
```dns
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none;
```

### Email Addresses Structure

| Address | Purpose | Configuration |
|---------|---------|---------------|
| `noreply@münchner-gastrotour.de` | App transactionals | Resend sender |
| `info@münchner-gastrotour.de` | Customer support | Forwards to personal |
| `admin@münchner-gastrotour.de` | System notifications | Forwards to personal |
| `hello@münchner-gastrotour.de` | General contact | Forwards to personal |

## Implementation Status

### ✅ Completed
- [x] Domain forwarding from .com to .de
- [x] Email forwarding setup on .com domain
- [x] Resend account setup
- [x] Punycode conversion for domain verification
- [x] Code comments documenting strategy

### 🔄 In Progress  
- [ ] DNS records added to .de domain at checkdomain.de
- [ ] Domain verification in Resend dashboard
- [ ] Environment variable update (EMAIL_FROM)

### 📋 Next Steps
1. Add DNS records to checkdomain.de control panel
2. Verify domain in Resend dashboard  
3. Update `EMAIL_FROM` environment variable:
   ```env
   EMAIL_FROM="Münchner Gastrotour <noreply@münchner-gastrotour.de>"
   ```
4. Test email delivery
5. Monitor DNS propagation (24-48 hours)

## Troubleshooting

### Domain Conversion Issues
If email services reject the domain:
```bash
# Verify Punycode conversion
python3 -c "import encodings.idna; print(encodings.idna.ToASCII('münchner-gastrotour.de').decode('ascii'))"
# Should output: xn--mnchner-gastrotour-m6b.de
```

### DNS Propagation Check
```bash
# Check MX records
dig MX send.münchner-gastrotour.de

# Check TXT records  
dig TXT send.münchner-gastrotour.de
dig TXT resend._domainkey.münchner-gastrotour.de
```

## Security Considerations

1. **DMARC Policy**: Start with `p=none` for monitoring, upgrade to `p=quarantine` later
2. **SPF Record**: Includes only Amazon SES to prevent spoofing
3. **DKIM**: Cryptographic email authentication
4. **Reply-To Headers**: Always point to .de domain for consistency

## Future Considerations

### Option A: Full Email Hosting Migration
- Move from email forwarding to proper email hosting
- Use `hello@münchner-gastrotour.de` as primary business email
- Requires: Email hosting service (Google Workspace, etc.)

### Option B: Enhanced Transactional Setup  
- Add more email templates (receipts, cancellations)
- Implement email analytics and tracking
- Set up automated email sequences

---

## Related Documentation

- [EMAIL-SETUP.md](./EMAIL-SETUP.md) - Current email configuration
- [RESEND-SETUP.md](./RESEND-SETUP.md) - Resend service configuration  
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Environment variables and deployment

---

**Last Updated**: December 2024  
**Responsible**: CTO/Technical Lead  
**Review**: Before any domain or email changes