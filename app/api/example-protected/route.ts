import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SimpleErrorTracker, handleApiError } from '@/lib/simple-error-tracker'
import { applyRateLimit, RATE_LIMITS } from '@/lib/simple-rate-limiter'

/**
 * Example API route showing how to use:
 * 1. Simple Error Tracker (replaces Sentry)
 * 2. Simple Rate Limiter (replaces Redis)
 * 
 * Copy this pattern to all your API routes!
 */

export async function POST(request: NextRequest) {
  let userEmail: string | undefined

  try {
    // 1. Apply rate limiting FIRST
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMITS.API_GENERAL,
      'api-example' // Optional prefix to separate different endpoints
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    // 2. Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { 
          status: 401,
          headers: rateLimitResult.headers
        }
      )
    }

    userEmail = user.email

    // 3. Parse request body
    const body = await request.json()
    
    // 4. Validate input
    if (!body.someField) {
      // Log validation warnings for debugging
      await SimpleErrorTracker.logWarning(
        'Missing required field: someField',
        {
          userEmail,
          component: 'API_EXAMPLE',
          additionalData: { body }
        }
      )
      
      return NextResponse.json(
        { error: 'someField ist erforderlich' },
        { 
          status: 400,
          headers: rateLimitResult.headers
        }
      )
    }

    // 5. Database operation
    const { data, error: dbError } = await supabase
      .from('some_table')
      .insert({
        user_id: user.id,
        some_field: body.someField,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      // Log database errors
      await SimpleErrorTracker.logError(
        new Error(`Database error: ${dbError.message}`),
        {
          userEmail,
          component: 'API_EXAMPLE',
          additionalData: {
            operation: 'INSERT',
            table: 'some_table',
            dbError
          }
        }
      )
      
      return NextResponse.json(
        { error: 'Datenbankfehler aufgetreten' },
        { 
          status: 500,
          headers: rateLimitResult.headers
        }
      )
    }

    // 6. Log successful operation (optional, for important actions)
    await SimpleErrorTracker.logInfo(
      'Successfully created record',
      {
        userEmail,
        component: 'API_EXAMPLE',
        additionalData: {
          recordId: data.id,
          operation: 'CREATE'
        }
      }
    )

    // 7. Return success with rate limit headers
    return NextResponse.json(
      { success: true, data },
      { 
        status: 200,
        headers: rateLimitResult.headers
      }
    )

  } catch (error) {
    // Catch all unexpected errors
    await handleApiError(
      error as Error,
      '/api/example-protected',
      'POST',
      userEmail
    )

    return NextResponse.json(
      { error: 'Unerwarteter Fehler aufgetreten' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Different rate limit for GET requests
    const rateLimitResult = await applyRateLimit(
      request,
      RATE_LIMITS.PUBLIC_GENERAL, // More generous for read operations
      'api-example-get'
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    // Public endpoint - no authentication required
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('some_table')
      .select('id, some_field, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      await SimpleErrorTracker.logError(
        new Error(`Database error in GET: ${error.message}`),
        {
          component: 'API_EXAMPLE_GET',
          additionalData: { error }
        }
      )
      
      return NextResponse.json(
        { error: 'Daten konnten nicht geladen werden' },
        { 
          status: 500,
          headers: rateLimitResult.headers
        }
      )
    }

    return NextResponse.json(
      { data },
      { 
        status: 200,
        headers: rateLimitResult.headers
      }
    )

  } catch (error) {
    await handleApiError(
      error as Error,
      '/api/example-protected',
      'GET'
    )

    return NextResponse.json(
      { error: 'Unerwarteter Fehler aufgetreten' },
      { status: 500 }
    )
  }
}