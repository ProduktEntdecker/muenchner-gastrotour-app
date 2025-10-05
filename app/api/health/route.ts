/**
 * Enhanced Health Check Endpoint
 * For monitoring application health with error tracking
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SimpleErrorTracker } from '@/lib/simple-error-tracker';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      memory: 'unknown',
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      }
    }
  };

  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are not configured');
    }

    // Check Supabase database connection
    const supabase = await createClient();
    const startTime = Date.now();
    
    // Test database connectivity with a simple query
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
      
    const dbResponseTime = Date.now() - startTime;
    
    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows (acceptable)
      throw new Error(`Database connection failed: ${dbError.message}`);
    }

    checks.checks.database = `healthy (${dbResponseTime}ms)`;

    // Check memory usage
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapPercentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

    checks.checks.memory = `${heapUsedMB}MB / ${heapTotalMB}MB (${heapPercentage}%)`;

    // If memory usage is too high, warn
    if (heapPercentage > 90) {
      checks.status = 'degraded';
      checks.checks.memory += ' - HIGH USAGE';
    }

    return NextResponse.json(checks, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    // Log detailed error internally
    console.error('Health check failed:', error);

    // Track health check failures with SimpleErrorTracker
    await SimpleErrorTracker.logError(
      error as Error,
      {
        component: 'HEALTH_CHECK',
        additionalData: {
          action: 'HEALTH_CHECK_FAILURE',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }
      }
    );

    // Return generic error message to avoid leaking internal details
    checks.status = 'unhealthy';
    checks.checks.database = 'unhealthy';

    return NextResponse.json(checks, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

// Simple monitoring script to use with cron
// Add to crontab: */5 * * * * curl -f https://muenchner-gastrotour.de/api/health || echo "Site is down" | mail -s "Health Check Failed" admin@example.com