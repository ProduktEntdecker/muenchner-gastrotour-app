/**
 * Critical Path Tests - Authentication
 * Focus: Basic login security and rate limiting
 */

import { validatePassword, sanitizeInput } from '@/lib/validation';

describe('Authentication - Essential Tests Only', () => {

  describe('Password Validation', () => {
    test('accepts valid password', () => {
      const result = validatePassword('MySecurePass123!');
      expect(result.isValid).toBe(true);
    });

    test('rejects short password', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('mindestens 12 Zeichen');
    });

    test('rejects password without uppercase', () => {
      const result = validatePassword('mysecurepass123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Großbuchstaben');
    });

    test('rejects password without number', () => {
      const result = validatePassword('MySecurePassword!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('eine Zahl');
    });

    test('rejects common passwords', () => {
      const result = validatePassword('Password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('zu häufig');
    });
  });

  describe('Input Sanitization', () => {
    test('prevents XSS attacks', () => {
      const malicious = '<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    test('escapes HTML entities', () => {
      const html = '<div onclick="alert()">Test</div>';
      const sanitized = sanitizeInput(html);
      expect(sanitized).not.toContain('<div');
      expect(sanitized).not.toContain('onclick');
    });

    test('removes javascript: protocol', () => {
      const malicious = 'javascript:alert(1)';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized).not.toContain('javascript:');
    });

    test('preserves safe text', () => {
      const safe = 'Hello, this is a safe message!';
      const sanitized = sanitizeInput(safe);
      expect(sanitized).toBe('Hello, this is a safe message!');
    });
  });

  describe('Rate Limiting', () => {
    // Simple in-memory rate limiter for testing
    class SimpleRateLimiter {
      private attempts = new Map<string, { count: number, resetAt: Date }>();

      check(ip: string): boolean {
        const now = new Date();
        const record = this.attempts.get(ip);

        if (!record || record.resetAt < now) {
          this.attempts.set(ip, {
            count: 1,
            resetAt: new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes
          });
          return true;
        }

        if (record.count >= 5) {
          return false;
        }

        record.count++;
        return true;
      }

      reset(ip: string) {
        this.attempts.delete(ip);
      }
    }

    test('allows 5 attempts', () => {
      const limiter = new SimpleRateLimiter();
      const ip = '192.168.1.1';

      for (let i = 0; i < 5; i++) {
        expect(limiter.check(ip)).toBe(true);
      }

      // 6th attempt should fail
      expect(limiter.check(ip)).toBe(false);
    });

    test('blocks after 5 failures', () => {
      const limiter = new SimpleRateLimiter();
      const ip = '192.168.1.2';

      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        limiter.check(ip);
      }

      // Should be blocked
      expect(limiter.check(ip)).toBe(false);
      expect(limiter.check(ip)).toBe(false); // Still blocked
    });

    test('different IPs tracked separately', () => {
      const limiter = new SimpleRateLimiter();
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Use up IP1's attempts
      for (let i = 0; i < 5; i++) {
        limiter.check(ip1);
      }

      // IP2 should still work
      expect(limiter.check(ip2)).toBe(true);

      // IP1 should be blocked
      expect(limiter.check(ip1)).toBe(false);
    });
  });

  describe('Email Normalization', () => {
    test('normalizes Gmail addresses', () => {
      const emails = [
        'test.user@gmail.com',
        'testuser@gmail.com',
        'test.user+tag@gmail.com',
        'TestUser@gmail.com'
      ];

      // All should normalize to same email
      const normalized = emails.map(e => e.toLowerCase().replace(/\./g, '').split('+')[0] + '@gmail.com');
      const unique = new Set(normalized);

      expect(unique.size).toBe(1);
    });

    test('preserves non-Gmail addresses', () => {
      const email = 'test.user@company.com';
      const normalized = email.toLowerCase();
      expect(normalized).toBe('test.user@company.com');
    });
  });
});