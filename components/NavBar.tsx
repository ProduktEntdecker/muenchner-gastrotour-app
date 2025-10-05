'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
}

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (alive) {
          setUser(data.user)
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [])

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    if (res.ok) {
      setUser(null)
      window.location.href = '/'
    }
  }

  if (loading) return null

  return (
    <>
      {user ? (
        <>
          <Link href="/events" className="btn ghost">Events</Link>
          <Link href="/bookings" className="btn ghost">Meine Buchungen</Link>
          <span style={{ marginRight: '10px', fontSize: '14px' }}>
            {user.name}
          </span>
          {user.isAdmin && (
            <Link href="/admin" className="btn ghost">Admin</Link>
          )}
          <button onClick={handleLogout} className="btn ghost">Abmelden</button>
        </>
      ) : (
        <>
          <Link href="/events" className="btn ghost">Events</Link>
          <Link href="/login" className="btn ghost">Anmelden</Link>
          <Link href="/register" className="btn">Registrieren</Link>
        </>
      )}
    </>
  )
}