import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile?.full_name || user.user_metadata?.full_name,
        isAdmin: profile?.is_admin || false,
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Session-Fehler' },
      { status: 500 }
    )
  }
}