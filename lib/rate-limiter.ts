/**
 * Simple Rate Limiter with File Persistence
 * For small-scale applications (100 users)
 *
 * Why not Redis? For 100 users, this is sufficient and simpler to maintain.
 */

import fs from 'fs';
import path from 'path';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class PersistentRateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private persistFile: string;
  private maxAttempts: number;
  private windowMs: number;
  private saveInterval: NodeJS.Timeout | null = null;

  constructor(
    maxAttempts = 5,
    windowMs = 15 * 60 * 1000, // 15 minutes
    persistFile = '.rate-limit-data.json'
  ) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.persistFile = path.join(process.cwd(), persistFile);

    // Load persisted data on startup
    this.load();

    // Save every 30 seconds (batched for efficiency)
    this.saveInterval = setInterval(() => {
      this.save();
    }, 30000);

    // Save on process exit
    process.on('beforeExit', () => this.save());
    process.on('SIGINT', () => {
      this.save();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      this.save();
      process.exit(0);
    });
  }

  private load(): void {
    try {
      if (fs.existsSync(this.persistFile)) {
        const data = fs.readFileSync(this.persistFile, 'utf8');
        const parsed = JSON.parse(data);
        const now = Date.now();

        // Load and filter out expired entries
        Object.entries(parsed).forEach(([ip, entry]: [string, any]) => {
          if (entry.resetAt > now) {
            this.attempts.set(ip, {
              count: entry.count,
              resetAt: entry.resetAt
            });
          }
        });

        console.log(`Loaded rate limit data for ${this.attempts.size} IPs`);
      }
    } catch (error) {
      console.error('Failed to load rate limit data:', error);
      // Continue with empty map
    }
  }

  private save(): void {
    try {
      const now = Date.now();
      const data: Record<string, RateLimitEntry> = {};

      // Only save non-expired entries
      this.attempts.forEach((entry, ip) => {
        if (entry.resetAt > now) {
          data[ip] = entry;
        }
      });

      fs.writeFileSync(
        this.persistFile,
        JSON.stringify(data, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save rate limit data:', error);
      // Non-critical, continue operation
    }
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance on each check
      this.cleanup();
    }

    // No previous attempts or expired
    if (!entry || entry.resetAt < now) {
      this.attempts.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs
      });
      return true;
    }

    // Already at limit
    if (entry.count >= this.maxAttempts) {
      return false;
    }

    // Increment counter
    entry.count++;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry || entry.resetAt < Date.now()) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - entry.count);
  }

  getResetTime(identifier: string): Date | null {
    const entry = this.attempts.get(identifier);
    if (!entry || entry.resetAt < Date.now()) {
      return null;
    }
    return new Date(entry.resetAt);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    this.attempts.forEach((entry, ip) => {
      if (entry.resetAt < now) {
        this.attempts.delete(ip);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }

  destroy(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    this.save();
  }
}

// Singleton instance
let rateLimiter: PersistentRateLimiter | null = null;

export function getRateLimiter(): PersistentRateLimiter {
  if (!rateLimiter) {
    rateLimiter = new PersistentRateLimiter();
  }
  return rateLimiter;
}

// Middleware helper for Next.js API routes
export function withRateLimit(
  handler: Function,
  options?: {
    maxAttempts?: number;
    windowMs?: number;
    keyGenerator?: (req: Request) => string;
  }
) {
  const limiter = getRateLimiter();

  return async (req: Request, ...args: any[]) => {
    // Get identifier (IP address or custom)
    const identifier = options?.keyGenerator
      ? options.keyGenerator(req)
      : req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        'unknown';

    // Check rate limit
    if (!limiter.check(identifier)) {
      const resetTime = limiter.getResetTime(identifier);
      return new Response(
        JSON.stringify({
          error: 'Zu viele Anfragen. Bitte später erneut versuchen.',
          resetAt: resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': resetTime
              ? Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString()
              : '900'
          }
        }
      );
    }

    // Continue with request
    return handler(req, ...args);
  };
}

export default getRateLimiter;