'use client'

import { useState, useEffect } from 'react'
import { SimpleErrorTracker } from '@/lib/simple-error-tracker'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ErrorLog {
  id: string
  level: string
  message: string
  stack_trace?: string
  component?: string
  user_email?: string
  url?: string
  user_agent?: string
  additional_data?: any
  created_at: string
  resolved_at?: string
  resolved_by?: string
}

export default function ErrorsPage() {
  const router = useRouter()
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    loadErrors()
  }, [filter])

  async function checkAdminAccess() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    // Check if user is admin (you can customize this logic)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_admin) {
      router.replace('/dashboard')
      return
    }

    setIsAdmin(true)
  }

  async function loadErrors() {
    try {
      const supabase = createClient()
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (filter !== 'all') {
        query = query.eq('level', filter)
      }
      
      const { data, error } = await query
      if (error) throw error
      
      setErrors(data || [])
    } catch (error) {
      console.error('Failed to load errors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function resolveError(errorId: string) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      await SimpleErrorTracker.resolveError(errorId, user.id) // Use user ID (UUID)
      loadErrors()
      
      if (selectedError?.id === errorId) {
        setSelectedError(null)
      }
    } catch (error) {
      console.error('Failed to resolve error:', error)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('de-DE')
  }

  function getLevelColor(level: string) {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50'
      case 'warn': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isAdmin) {
    return <div>Checking permissions...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Error Logs</h1>
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded px-3 py-1"
          >
            <option value="all">Alle Level</option>
            <option value="error">Fehler</option>
            <option value="warn">Warnungen</option>
            <option value="info">Info</option>
          </select>
          <button 
            onClick={loadErrors}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Aktualisieren
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Lade Fehler...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Error List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              {errors.length} Einträge {filter !== 'all' && `(${filter})`}
            </h2>
            
            {errors.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                🎉 Keine Fehler gefunden!
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {errors.map((error) => (
                  <div
                    key={error.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedError?.id === error.id ? 'ring-2 ring-blue-500' : ''
                    } ${error.resolved_at ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedError(error)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${getLevelColor(error.level)}`}>
                        {error.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(error.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm font-medium mb-1 truncate">
                      {error.message}
                    </div>
                    
                    <div className="text-xs text-gray-600 flex gap-4">
                      {error.component && (
                        <span>📍 {error.component}</span>
                      )}
                      {error.user_email && (
                        <span>👤 {error.user_email}</span>
                      )}
                      {error.resolved_at && (
                        <span className="text-green-600">✅ Behoben</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Details */}
          <div>
            {selectedError ? (
              <div className="border rounded p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${getLevelColor(selectedError.level)}`}>
                      {selectedError.level.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(selectedError.created_at)}
                    </span>
                  </div>
                  
                  {!selectedError.resolved_at && (
                    <button
                      onClick={() => resolveError(selectedError.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Als behoben markieren
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">Nachricht</h3>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      {selectedError.message}
                    </p>
                  </div>

                  {selectedError.stack_trace && (
                    <div>
                      <h3 className="font-semibold mb-1">Stack Trace</h3>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {selectedError.stack_trace}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedError.component && (
                      <div>
                        <strong>Komponente:</strong> {selectedError.component}
                      </div>
                    )}
                    {selectedError.user_email && (
                      <div>
                        <strong>Benutzer:</strong> {selectedError.user_email}
                      </div>
                    )}
                    {selectedError.url && (
                      <div className="col-span-2">
                        <strong>URL:</strong>{' '}
                        <a 
                          href={selectedError.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {selectedError.url}
                        </a>
                      </div>
                    )}
                    {selectedError.user_agent && (
                      <div className="col-span-2">
                        <strong>User Agent:</strong>
                        <p className="text-xs text-gray-600 break-all">
                          {selectedError.user_agent}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedError.additional_data && (
                    <div>
                      <h3 className="font-semibold mb-1">Zusätzliche Daten</h3>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(selectedError.additional_data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedError.resolved_at && (
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-sm text-green-800">
                        ✅ Behoben am {formatDate(selectedError.resolved_at)}
                        {selectedError.resolved_by && ` von ${selectedError.resolved_by}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border rounded p-8 text-center text-gray-500">
                Wählen Sie einen Fehler aus der Liste aus, um Details zu sehen
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}