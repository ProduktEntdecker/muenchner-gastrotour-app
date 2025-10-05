'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Booking {
  id: number
  status: 'confirmed' | 'waitlist' | 'cancelled'
  position?: number
  createdAt: string
  event: {
    id: number
    name: string
    date: string
    address: string
    description?: string
  }
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()

      if (res.ok) {
        setBookings(data.bookings || [])
      } else if (res.status === 401) {
        router.push('/login?redirect=/bookings')
      } else {
        setError(data.error || 'Fehler beim Laden der Buchungen')
      }
    } catch (err) {
      setError('Netzwerkfehler beim Laden der Buchungen')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Möchtest du diese Buchung wirklich stornieren?')) {
      return
    }

    setCancellingId(bookingId)

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        // Refresh bookings
        await fetchBookings()
      } else {
        const data = await res.json()
        alert(data.error || 'Stornierung fehlgeschlagen')
      }
    } catch (err) {
      alert('Netzwerkfehler bei der Stornierung')
    } finally {
      setCancellingId(null)
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

  const getStatusBadge = (booking: Booking) => {
    if (booking.status === 'confirmed') {
      return (
        <span style={{
          padding: '4px 12px',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ✅ Bestätigt
        </span>
      )
    } else if (booking.status === 'waitlist') {
      return (
        <span style={{
          padding: '4px 12px',
          background: '#fff3cd',
          color: '#856404',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ⏳ Warteliste {booking.position ? `(Position ${booking.position})` : ''}
        </span>
      )
    } else {
      return (
        <span style={{
          padding: '4px 12px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ❌ Storniert
        </span>
      )
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Lade deine Buchungen...</p>
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

  const upcomingBookings = bookings.filter(b => !isEventPast(b.event.date) && b.status !== 'cancelled')
  const pastBookings = bookings.filter(b => isEventPast(b.event.date) || b.status === 'cancelled')

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ marginBottom: '32px' }}>📋 Meine Buchungen</h1>

      {upcomingBookings.length === 0 && pastBookings.length === 0 && (
        <div style={{
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '16px' }}>Keine Buchungen vorhanden</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Du hast noch keine Events gebucht.
          </p>
          <a href="/events" className="btn">
            Events ansehen
          </a>
        </div>
      )}

      {upcomingBookings.length > 0 && (
        <>
          <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>📅 Kommende Buchungen</h2>
          <div style={{ display: 'grid', gap: '16px', marginBottom: '48px' }}>
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px' }}>{booking.event.name}</h3>
                      {getStatusBadge(booking)}
                    </div>
                    <p style={{ color: '#666', marginBottom: '8px' }}>
                      📅 {formatDate(booking.event.date)}
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      📍 {booking.event.address}
                    </p>
                    {booking.event.description && (
                      <p style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                        {booking.event.description}
                      </p>
                    )}
                  </div>

                  {booking.status === 'confirmed' && !isEventPast(booking.event.date) && (
                    <button
                      className="btn ghost"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      style={{ minWidth: '120px' }}
                    >
                      {cancellingId === booking.id ? 'Wird storniert...' : 'Stornieren'}
                    </button>
                  )}

                  {booking.status === 'waitlist' && (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        Du bist auf der Warteliste
                      </p>
                      <button
                        className="btn ghost"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        style={{ minWidth: '120px' }}
                      >
                        {cancellingId === booking.id ? 'Wird entfernt...' : 'Von Liste entfernen'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pastBookings.length > 0 && (
        <>
          <h2 style={{ marginBottom: '24px', fontSize: '20px', color: '#666' }}>
            📌 Vergangene Buchungen
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {pastBookings.map(booking => (
              <div
                key={booking.id}
                className="card"
                style={{
                  padding: '16px',
                  opacity: 0.7,
                  background: '#f8f9fa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ marginBottom: '4px', fontSize: '16px' }}>{booking.event.name}</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      {formatDate(booking.event.date)}
                    </p>
                  </div>
                  {getStatusBadge(booking)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}