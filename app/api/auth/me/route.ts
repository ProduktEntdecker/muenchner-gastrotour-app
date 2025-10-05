import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user from Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ user: null })
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, role')
      .eq('id', authUser.id)
      .single()

    if (profileError) {
      console.error('Get user profile error:', profileError)
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ 
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        isAdmin: profile.role === 'admin'
      }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ user: null })
  }
}
