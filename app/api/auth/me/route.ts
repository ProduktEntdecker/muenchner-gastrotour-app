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
      .select('id, email, full_name, is_admin')
      .eq('id', authUser.id)
      .single()

    if (profileError) {
      console.error('Get user profile error:', profileError)
      // Fallback to auth user metadata if profile not found
      return NextResponse.json({
        user: {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.email,
          isAdmin: false
        }
      })
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email || authUser.email,
        name: profile.full_name || authUser.user_metadata?.full_name || authUser.email,
        isAdmin: profile.is_admin === true
      }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ user: null })
  }
}
