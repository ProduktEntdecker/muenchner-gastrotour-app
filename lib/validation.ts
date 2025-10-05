/**
 * Email validation and normalization utilities
 * Provides RFC 5322 compliant email validation and normalization
 */

/**
 * Validates email format using a comprehensive regex pattern
 * Uses RFC 5322 compliant regex with additional length and structure checks
 * @param email - The email address to validate
 * @returns boolean indicating if email is valid (max 254 chars, proper @ structure)
 * @example
 * ```typescript
 * isValidEmail('test@example.com') // returns true
 * isValidEmail('invalid@') // returns false
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Additional checks
  const trimmedEmail = email.trim()
  if (trimmedEmail.length > 254) return false // Max email length per RFC
  if (trimmedEmail.split('@').length !== 2) return false

  return emailRegex.test(trimmedEmail)
}

/**
 * Normalizes email address for consistent storage and comparison
 * Ensures consistent handling of email addresses by:
 * 1. Validating the email format first
 * 2. Normalizing to lowercase
 * 3. Handling Gmail-specific normalization (dots removal, alias handling)
 * 4. Processing plus-aliases for all email providers
 * 
 * @param email - The email address to normalize
 * @returns normalized email or null if invalid
 * @example
 * ```typescript
 * normalizeEmail('Test@Gmail.com') // returns 'test@gmail.com'
 * normalizeEmail('test+alias@gmail.com') // returns 'test@gmail.com'
 * normalizeEmail('te.st@gmail.com') // returns 'test@gmail.com'
 * normalizeEmail('user+filter@example.com') // returns 'user@example.com'
 * normalizeEmail('invalid@') // returns null
 * ```
 */
export function normalizeEmail(email: string): string | null {
  if (!isValidEmail(email)) return null

  // Basic normalization: trim and lowercase
  let normalized = email.trim().toLowerCase()

  // Handle Gmail-style addresses (remove dots and everything after +)
  const [localPart, domain] = normalized.split('@')

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove dots from local part
    let cleanLocal = localPart.replace(/\./g, '')
    // Remove everything after + (aliases)
    const plusIndex = cleanLocal.indexOf('+')
    if (plusIndex > -1) {
      cleanLocal = cleanLocal.substring(0, plusIndex)
    }
    normalized = `${cleanLocal}@gmail.com` // Normalize googlemail to gmail
  } else {
    // For other providers, just remove aliases (everything after +)
    const plusIndex = localPart.indexOf('+')
    if (plusIndex > -1) {
      normalized = `${localPart.substring(0, plusIndex)}@${domain}`
    }
  }

  return normalized
}

/**
 * Validates and normalizes user input without HTML encoding
 * Security-focused input sanitization that:
 * 1. Trims whitespace
 * 2. Rejects obvious script injection attempts 
 * 3. Validates against allowed character patterns (letters, marks, spaces, apostrophes, hyphens, dots)
 * 4. Follows secure-by-default principles
 * 
 * Note: HTML encoding should be done at render time, not storage time
 * 
 * @param input - The user input to validate (typically names, titles, etc.)
 * @returns normalized string or empty string if invalid/potentially malicious
 * @example
 * ```typescript
 * sanitizeInput('  John Doe  ') // returns 'John Doe'
 * sanitizeInput('Jean-Pierre O\'Connor') // returns 'Jean-Pierre O\'Connor' 
 * sanitizeInput('María José') // returns 'María José'
 * sanitizeInput('<script>alert("xss")</script>') // returns ''
 * sanitizeInput('User123') // returns '' (numbers not allowed in names)
 * ```
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''

  // Normalize and validate input without HTML encoding
  const normalized = input.trim()

  // Reject if contains control characters or obvious script tags
  if (/<script|javascript:|on\w+=/i.test(normalized)) {
    return ''
  }

  // Allow names with apostrophes, hyphens, spaces, and international characters
  if (!/^[\p{L}\p{M}\s'\-\.]+$/u.test(normalized)) {
    return ''
  }

  return normalized
}

/**
 * HTML encode strings for safe display (use at render time, not storage)
 * @param input - The string to encode for HTML display
 * @returns HTML-encoded string
 */
export function htmlEncode(input: string): string {
  if (!input || typeof input !== 'string') return ''

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validates password strength with enhanced security requirements
 * Implements comprehensive password validation with the following requirements:
 * 1. Minimum 12 characters (increased from typical 8 for better security)
 * 2. Maximum 128 characters (prevents DoS attacks)
 * 3. Must contain uppercase letters (A-Z)
 * 4. Must contain lowercase letters (a-z) 
 * 5. Must contain numbers (0-9)
 * 6. Must contain special characters (!@#$%^&* etc.)
 * 7. Rejects common patterns like repeated characters and dictionary words
 * 
 * @param password - The password string to validate
 * @returns object with validation result and German error message if invalid
 * @example
 * ```typescript
 * validatePassword('MySecure123!') // { isValid: true }
 * validatePassword('weak') // { isValid: false, message: 'Passwort muss mindestens 12 Zeichen lang sein' }
 * validatePassword('NoSpecialChar123') // { isValid: false, message: 'Passwort muss mindestens ein Sonderzeichen enthalten' }
 * validatePassword('password123!') // { isValid: false, message: 'Passwort enthält häufig verwendete Muster' }
 * ```
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Passwort ist erforderlich' }
  }

  // Minimum length increased for better security
  if (password.length < 12) {
    return { isValid: false, message: 'Passwort muss mindestens 12 Zeichen lang sein' }
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Passwort darf maximal 128 Zeichen lang sein' }
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Passwort muss mindestens einen Großbuchstaben enthalten' }
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Passwort muss mindestens einen Kleinbuchstaben enthalten' }
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Passwort muss mindestens eine Zahl enthalten' }
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return { isValid: false, message: 'Passwort muss mindestens ein Sonderzeichen enthalten (!@#$%^&* etc.)' }
  }

  // Check for common patterns that should be avoided
  const commonPatterns = [
    /(.)\1{3,}/, // Four or more consecutive identical characters
    /123456|654321|111111|000000/, // Common number sequences
    /qwerty|asdfgh|password|passwort/i, // Common keyboard patterns and words
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      return { isValid: false, message: 'Passwort enthält häufig verwendete Muster und ist nicht sicher' }
    }
  }

  return { isValid: true }
}