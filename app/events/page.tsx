'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReviewForm from '@/components/ReviewForm'

interface AverageRating {
  food: number
  ambiance: number
  service: number
  overall: number
}

interface Event {
  id: string
  name: string
  date: string
  address: string
  description?: string
  menuUrl?: string
  imageUrl?: string
  pressReview?: string
  pressSource?: string
  maxSeats: number
  seatsAvailable: number
  seatsTaken: number
  attendees: { id: string; name: string }[]
  cuisineType?: string
  reviewCount: number
  averageRating: AverageRating | null
  userAttended: boolean
  userReviewed: boolean
}

export default function EventsPage(): JSX.Element {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingStatus, setBookingStatus] = useState<{ [key: string]: string }>({})
  const [cuisineFilter, setCuisineFilter] = useState<string>('all')
  const [reviewingEvent, setReviewingEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      // Fetch all events (not just upcoming) to show past events with reviews
      const res = await fetch('/api/events?limit=50')
      const data = await res.json()

      if (res.ok) {
        setEvents(data.events || [])
      } else {
        setError(data.error || 'Fehler beim Laden der Events')
      }
    } catch {
      setError('Netzwerkfehler beim Laden der Events')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (eventId: string) => {
    setBookingStatus(prev => ({ ...prev, [eventId]: 'loading' }))

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      })

      const data = await res.json()

      if (res.ok) {
        setBookingStatus(prev => ({ ...prev, [eventId]: 'success' }))
        // Refresh events to update seat counts
        await fetchEvents()
        setTimeout(() => {
          setBookingStatus(prev => ({ ...prev, [eventId]: '' }))
        }, 3000)
      } else if (res.status === 401) {
        // Redirect to login if not authenticated
        router.push('/login?redirect=/events')
      } else {
        setBookingStatus(prev => ({ ...prev, [eventId]: data.error || 'Buchung fehlgeschlagen' }))
        setTimeout(() => {
          setBookingStatus(prev => ({ ...prev, [eventId]: '' }))
        }, 5000)
      }
    } catch (err) {
      setBookingStatus(prev => ({ ...prev, [eventId]: 'Netzwerkfehler' }))
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [eventId]: '' }))
      }, 5000)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Lade Events...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="error" role="alert">{error}</div>
      </div>
    )
  }

  const upcomingEvents = events
    .filter(e => !isEventPast(e.date))
    .filter(e => cuisineFilter === 'all' || e.cuisineType === cuisineFilter)
  const pastEvents = events.filter(e => isEventPast(e.date))

  // Get unique cuisine types from events
  const cuisineTypes = Array.from(new Set(events.map(e => e.cuisineType).filter(Boolean)))
    .sort()

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <p className="tagline">Unsere Termine</p>
        <h1 style={{ marginBottom: '12px' }}>Gastrotour Events</h1>
        <div className="decorative-line"></div>
      </div>

      {cuisineTypes.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <label
            htmlFor="cuisine-filter"
            style={{
              marginRight: '16px',
              fontFamily: 'var(--font-ui)',
              fontWeight: '500',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--ink-soft)'
            }}
          >
            Küche filtern:
          </label>
          <select
            id="cuisine-filter"
            data-testid="cuisine-filter"
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)',
              fontSize: '15px',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              background: 'white',
              color: 'var(--ink)'
            }}
          >
            <option value="all">Alle Küchen</option>
            {cuisineTypes.map(cuisine => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>
      )}

      {upcomingEvents.length === 0 && (
        <div data-testid="no-events" style={{
          padding: '60px 40px',
          background: 'var(--paper-warm)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          marginBottom: '40px',
          border: '1px solid var(--line)'
        }}>
          <h2 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Keine kommenden Events</h2>
          <p style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
            Aktuell sind keine Events geplant. Schau später wieder vorbei!
          </p>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <>
          <h2 style={{
            marginBottom: '28px',
            fontSize: '1.25rem',
            fontFamily: 'var(--font-display)',
            fontWeight: '500',
            color: 'var(--ink)'
          }}>Kommende Events</h2>
          <div style={{ display: 'grid', gap: '28px', marginBottom: '60px' }}>
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="card event-card"
                data-testid="event-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: event.seatsAvailable === 0
                    ? '1px solid var(--bordeaux)'
                    : '1px solid var(--messing-light)'
                }}
              >
                {/* Restaurant Image */}
                {event.imageUrl && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}
                <div style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <h3 data-testid="event-name" style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.5rem',
                        fontWeight: '500',
                        margin: 0,
                        color: 'var(--ink)'
                      }}>{event.name}</h3>
                      {event.cuisineType && (
                        <span
                          data-testid="cuisine-badge"
                          className="cuisine-badge"
                        >
                          {event.cuisineType}
                        </span>
                      )}
                    </div>
                    <p data-testid="event-date" style={{
                      color: 'var(--ink-soft)',
                      marginBottom: '16px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px'
                    }}>
                      {formatDate(event.date)}
                    </p>
                    <p data-testid="event-address" style={{
                      marginBottom: '12px',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--ink)'
                    }}>
                      {event.address}
                    </p>
                    {event.description && (
                      <p style={{
                        marginTop: '16px',
                        color: 'var(--ink-soft)',
                        fontFamily: 'var(--font-body)',
                        lineHeight: '1.7'
                      }}>
                        {event.description}
                      </p>
                    )}
                    {event.menuUrl && (
                      <a
                        href={event.menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          marginTop: '16px',
                          color: 'var(--messing-dark)',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Speisekarte ansehen →
                      </a>
                    )}
                    {event.pressReview && (
                      <div style={{ marginTop: '20px' }}>
                        <blockquote className="quote">
                          „{event.pressReview}"
                        </blockquote>
                        {event.pressSource && (
                          <p className="quote-author">
                            — {event.pressSource}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="seat-counter" style={{
                    textAlign: 'center',
                    minWidth: '220px',
                    margin: 0
                  }}>
                    <div data-testid="seats-available" className="number" style={{
                      color: event.seatsAvailable === 0 ? 'var(--bordeaux)' : 'var(--messing-dark)'
                    }}>
                      {event.seatsAvailable}
                    </div>
                    <div className="label">
                      von {event.maxSeats} Plätzen verfügbar
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      {bookingStatus[event.id] === 'loading' ? (
                        <button className="btn full" disabled>
                          Wird gebucht...
                        </button>
                      ) : bookingStatus[event.id] === 'success' ? (
                        <div style={{
                          color: 'var(--messing-dark)',
                          fontWeight: '600',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '14px'
                        }}>
                          Erfolgreich gebucht!
                        </div>
                      ) : bookingStatus[event.id] ? (
                        <div style={{
                          color: 'var(--bordeaux)',
                          fontSize: '14px',
                          fontFamily: 'var(--font-ui)'
                        }}>
                          {bookingStatus[event.id]}
                        </div>
                      ) : (
                        <button
                          className="btn full"
                          onClick={() => handleBooking(event.id)}
                          disabled={event.seatsAvailable === 0}
                        >
                          {event.seatsAvailable === 0 ? 'Ausgebucht' : 'Platz reservieren'}
                        </button>
                      )}
                    </div>

                    {event.attendees.length > 0 && (
                      <details style={{ marginTop: '20px', textAlign: 'left' }}>
                        <summary style={{
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: 'var(--ink-soft)',
                          fontFamily: 'var(--font-ui)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {event.attendees.length} Teilnehmer
                        </summary>
                        <ul style={{
                          marginTop: '12px',
                          fontSize: '14px',
                          paddingLeft: '20px',
                          fontFamily: 'var(--font-body)',
                          color: 'var(--ink-soft)'
                        }}>
                          {event.attendees.map(attendee => (
                            <li key={attendee.id} style={{ marginBottom: '4px' }}>{attendee.name}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pastEvents.length > 0 && (
        <div style={{ marginTop: '60px' }}>
          <h2 style={{
            marginBottom: '28px',
            fontSize: '1.25rem',
            fontFamily: 'var(--font-display)',
            fontWeight: '500',
            color: 'var(--ink-soft)'
          }}>
            Vergangene Events
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {pastEvents.map(event => (
              <div
                key={event.id}
                className="card"
                style={{
                  padding: '20px 24px',
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--line)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{
                      marginBottom: '8px',
                      fontSize: '1.1rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: '500',
                      color: 'var(--ink-soft)'
                    }}>{event.name}</h3>
                    <p style={{
                      color: 'var(--ink-soft)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-body)',
                      marginBottom: '8px'
                    }}>
                      {formatDate(event.date)} · {event.attendees.length} Teilnehmer
                    </p>

                    {/* Average Rating Display */}
                    {event.averageRating && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '8px'
                      }}>
                        <span style={{ color: 'var(--messing-dark)', fontSize: '18px' }}>
                          {'★'.repeat(Math.round(event.averageRating.overall))}
                          {'☆'.repeat(5 - Math.round(event.averageRating.overall))}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          color: 'var(--ink-soft)',
                          fontFamily: 'var(--font-ui)'
                        }}>
                          {event.averageRating.overall.toFixed(1)} ({event.reviewCount} {event.reviewCount === 1 ? 'Bewertung' : 'Bewertungen'})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Review Button */}
                  <div style={{ textAlign: 'right' }}>
                    {event.userAttended && !event.userReviewed && (
                      <button
                        className="btn secondary"
                        onClick={() => setReviewingEvent(event)}
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                      >
                        Bewerten
                      </button>
                    )}
                    {event.userReviewed && (
                      <span style={{
                        fontSize: '13px',
                        color: 'var(--messing-dark)',
                        fontFamily: 'var(--font-ui)'
                      }}>
                        ✓ Bewertet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingEvent && (
        <ReviewForm
          eventId={reviewingEvent.id}
          eventName={reviewingEvent.name}
          onClose={() => setReviewingEvent(null)}
          onSuccess={() => {
            setReviewingEvent(null)
            fetchEvents() // Refresh to show updated review status
          }}
        />
      )}
    </div>
  )
}