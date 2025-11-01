'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Event {
  id: number
  name: string
  date: string
  address: string
  description?: string
  menuUrl?: string
  maxSeats: number
  seatsAvailable: number
  seatsTaken: number
  attendees: { id: number; name: string }[]
  cuisineType?: string
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingStatus, setBookingStatus] = useState<{ [key: number]: string }>({})
  const [cuisineFilter, setCuisineFilter] = useState<string>('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events?upcoming=true')
      const data = await res.json()

      if (res.ok) {
        setEvents(data.events || [])
      } else {
        setError(data.error || 'Fehler beim Laden der Events')
      }
    } catch (err) {
      setError('Netzwerkfehler beim Laden der Events')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (eventId: number) => {
    setBookingStatus({ ...bookingStatus, [eventId]: 'loading' })

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      })

      const data = await res.json()

      if (res.ok) {
        setBookingStatus({ ...bookingStatus, [eventId]: 'success' })
        // Refresh events to update seat counts
        await fetchEvents()
        setTimeout(() => {
          setBookingStatus({ ...bookingStatus, [eventId]: '' })
        }, 3000)
      } else if (res.status === 401) {
        // Redirect to login if not authenticated
        router.push('/login?redirect=/events')
      } else {
        setBookingStatus({ ...bookingStatus, [eventId]: data.error || 'Buchung fehlgeschlagen' })
        setTimeout(() => {
          setBookingStatus({ ...bookingStatus, [eventId]: '' })
        }, 5000)
      }
    } catch (err) {
      setBookingStatus({ ...bookingStatus, [eventId]: 'Netzwerkfehler' })
      setTimeout(() => {
        setBookingStatus({ ...bookingStatus, [eventId]: '' })
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
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ marginBottom: '32px' }}>🍽️ Gastrotour Events</h1>

      {cuisineTypes.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <label htmlFor="cuisine-filter" style={{ marginRight: '12px', fontWeight: '500' }}>
            Küche filtern:
          </label>
          <select
            id="cuisine-filter"
            data-testid="cuisine-filter"
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
              cursor: 'pointer'
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
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{ marginBottom: '16px' }}>Keine kommenden Events</h2>
          <p style={{ color: '#666' }}>
            Aktuell sind keine Events geplant. Schau später wieder vorbei!
          </p>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <>
          <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>📅 Kommende Events</h2>
          <div style={{ display: 'grid', gap: '24px', marginBottom: '48px' }}>
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="card"
                data-testid="event-card"
                style={{
                  padding: '24px',
                  border: event.seatsAvailable === 0 ? '2px solid #dc3545' : '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 data-testid="event-name" style={{ fontSize: '24px', margin: 0 }}>{event.name}</h3>
                      {event.cuisineType && (
                        <span
                          data-testid="cuisine-badge"
                          style={{
                            padding: '4px 12px',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          {event.cuisineType}
                        </span>
                      )}
                    </div>
                    <p data-testid="event-date" style={{ color: '#666', marginBottom: '16px' }}>
                      📅 {formatDate(event.date)}
                    </p>
                    <p data-testid="event-address" style={{ marginBottom: '8px' }}>
                      📍 {event.address}
                    </p>
                    {event.description && (
                      <p style={{ marginTop: '12px', color: '#333' }}>
                        {event.description}
                      </p>
                    )}
                    {event.menuUrl && (
                      <a
                        href={event.menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', marginTop: '12px' }}
                      >
                        🔗 Speisekarte ansehen
                      </a>
                    )}
                  </div>

                  <div style={{
                    textAlign: 'center',
                    minWidth: '200px',
                    padding: '16px',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div data-testid="seats-available" style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: event.seatsAvailable === 0 ? '#dc3545' : '#28a745',
                      marginBottom: '8px'
                    }}>
                      {event.seatsAvailable}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                      von {event.maxSeats} Plätzen verfügbar
                    </div>

                    {bookingStatus[event.id] === 'loading' ? (
                      <button className="btn" disabled style={{ width: '100%' }}>
                        Wird gebucht...
                      </button>
                    ) : bookingStatus[event.id] === 'success' ? (
                      <div style={{ color: '#28a745', fontWeight: 'bold' }}>
                        ✅ Erfolgreich gebucht!
                      </div>
                    ) : bookingStatus[event.id] ? (
                      <div style={{ color: '#dc3545', fontSize: '14px' }}>
                        {bookingStatus[event.id]}
                      </div>
                    ) : (
                      <button
                        className="btn"
                        onClick={() => handleBooking(event.id)}
                        disabled={event.seatsAvailable === 0}
                        style={{ width: '100%' }}
                      >
                        {event.seatsAvailable === 0 ? 'Ausgebucht' : 'Platz reservieren'}
                      </button>
                    )}

                    {event.attendees.length > 0 && (
                      <details style={{ marginTop: '16px', textAlign: 'left' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '14px', color: '#666' }}>
                          {event.attendees.length} Teilnehmer
                        </summary>
                        <ul style={{ marginTop: '8px', fontSize: '14px', paddingLeft: '20px' }}>
                          {event.attendees.map(attendee => (
                            <li key={attendee.id}>{attendee.name}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pastEvents.length > 0 && (
        <>
          <h2 style={{ marginBottom: '24px', fontSize: '20px', color: '#666' }}>
            📌 Vergangene Events
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {pastEvents.map(event => (
              <div
                key={event.id}
                className="card"
                style={{
                  padding: '16px',
                  opacity: 0.7,
                  background: '#f8f9fa'
                }}
              >
                <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>{event.name}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  {formatDate(event.date)} • {event.attendees.length} Teilnehmer
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}