import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET reviews for an event
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
  }

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      id,
      food_rating,
      ambiance_rating,
      service_rating,
      review_text,
      created_at,
      profiles:user_id (
        full_name
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }

  // Calculate average ratings
  const avgRatings = reviews.length > 0 ? {
    food: reviews.reduce((sum, r) => sum + (r.food_rating || 0), 0) / reviews.length,
    ambiance: reviews.reduce((sum, r) => sum + (r.ambiance_rating || 0), 0) / reviews.length,
    service: reviews.reduce((sum, r) => sum + (r.service_rating || 0), 0) / reviews.length,
    overall: reviews.reduce((sum, r) => {
      const avg = ((r.food_rating || 0) + (r.ambiance_rating || 0) + (r.service_rating || 0)) / 3
      return sum + avg
    }, 0) / reviews.length
  } : null

  return NextResponse.json({
    reviews: reviews.map(r => ({
      id: r.id,
      foodRating: r.food_rating,
      ambianceRating: r.ambiance_rating,
      serviceRating: r.service_rating,
      text: r.review_text,
      authorName: (r.profiles as { full_name: string } | null)?.full_name || 'Anonym',
      createdAt: r.created_at
    })),
    averageRatings: avgRatings,
    totalReviews: reviews.length
  })
}

// POST create a new review
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const body = await request.json()
  const { eventId, foodRating, ambianceRating, serviceRating, text } = body

  // Validate required fields
  if (!eventId) {
    return NextResponse.json({ error: 'Event ID erforderlich' }, { status: 400 })
  }

  // Validate ratings (1-5)
  const validateRating = (r: unknown): r is number =>
    typeof r === 'number' && r >= 1 && r <= 5

  if (!validateRating(foodRating) || !validateRating(ambianceRating) || !validateRating(serviceRating)) {
    return NextResponse.json({ error: 'Alle Bewertungen müssen zwischen 1 und 5 sein' }, { status: 400 })
  }

  // Check if event exists and is in the past
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, date, name')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return NextResponse.json({ error: 'Event nicht gefunden' }, { status: 404 })
  }

  if (new Date(event.date) > new Date()) {
    return NextResponse.json({ error: 'Du kannst nur vergangene Events bewerten' }, { status: 400 })
  }

  // Check if user had a booking for this event
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Du kannst nur Events bewerten, an denen du teilgenommen hast' }, { status: 403 })
  }

  // Check for existing review
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  if (existingReview) {
    return NextResponse.json({ error: 'Du hast dieses Event bereits bewertet' }, { status: 409 })
  }

  // Create review
  const { data: review, error: insertError } = await supabase
    .from('reviews')
    .insert({
      event_id: eventId,
      user_id: user.id,
      food_rating: foodRating,
      ambiance_rating: ambianceRating,
      service_rating: serviceRating,
      review_text: text?.slice(0, 1000) || null
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error creating review:', insertError)
    return NextResponse.json({ error: 'Bewertung konnte nicht gespeichert werden' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    review: {
      id: review.id,
      foodRating: review.food_rating,
      ambianceRating: review.ambiance_rating,
      serviceRating: review.service_rating,
      text: review.review_text
    }
  }, { status: 201 })
}
