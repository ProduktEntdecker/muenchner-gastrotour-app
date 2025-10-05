import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    envKeys: Object.keys(process.env)
      .filter(key => key.includes('SUPABASE') || key.includes('NEXT_PUBLIC'))
      .map(key => ({
        key,
        hasValue: !!process.env[key],
        length: process.env[key]?.length || 0
      }))
  });
}