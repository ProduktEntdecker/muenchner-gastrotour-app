/**
 * Date utilities for consistent timezone handling
 * All dates are displayed in Munich timezone (Europe/Berlin)
 */

/**
 * Format a date for display in Munich timezone
 * @param dateInput - Date string or Date object
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string in German locale
 */
export function formatDateForDisplay(
  dateInput: string | Date,
  includeTime: boolean = true
): string {
  if (!dateInput) return ''

  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateInput)
      return ''
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Berlin', // Munich timezone
    }

    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }

    return date.toLocaleDateString('de-DE', options)
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Parse a date string ensuring correct timezone handling
 * @param dateStr - Date string in ISO format or German format
 * @returns Date object or null if invalid
 */
export function parseEventDate(dateStr: string): Date | null {
  if (!dateStr) return null

  try {
    // If it's already a valid ISO string, parse it directly
    if (dateStr.includes('T') || dateStr.includes('Z')) {
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) return date
    }

    // Handle German format (DD.MM.YYYY HH:mm)
    if (dateStr.includes('.')) {
      const [datePart, timePart] = dateStr.split(' ')
      if (!datePart) return null
      const [day, month, year] = datePart.split('.')
      if (!day || !month || !year) return null
      const [hour, minute] = timePart ? timePart.split(':') : ['12', '00']

      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      )

      if (!isNaN(date.getTime())) return date
    }

    // Handle YYYY-MM-DD HH:mm format
    if (dateStr.includes('-')) {
      const [datePart, timePart] = dateStr.split(' ')
      if (!datePart) return null
      const [year, month, day] = datePart.split('-')
      if (!year || !month || !day) return null
      const [hour, minute] = timePart ? timePart.split(':') : ['12', '00']

      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      )

      if (!isNaN(date.getTime())) return date
    }

    return null
  } catch (error) {
    console.error('Error parsing date:', error)
    return null
  }
}

/**
 * Check if an event date is in the past
 * @param dateInput - Date string or Date object
 * @returns true if the date is in the past
 */
export function isEventPast(dateInput: string | Date): boolean {
  if (!dateInput) return false

  try {
    const date = typeof dateInput === 'string' ? parseEventDate(dateInput) : dateInput
    if (!date) return false

    return date < new Date()
  } catch {
    return false
  }
}

/**
 * Format date for API/database storage (ISO 8601)
 * @param date - Date object
 * @returns ISO string
 */
export function formatDateForStorage(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided for storage formatting')
  }
  return date.toISOString()
}

/**
 * Get relative time description (e.g., "in 2 days", "3 hours ago")
 * @param dateInput - Date string or Date object
 * @returns Relative time string in German
 */
export function getRelativeTime(dateInput: string | Date): string {
  if (!dateInput) return ''

  try {
    const date = typeof dateInput === 'string' ? parseEventDate(dateInput) : dateInput
    if (!date) return ''

    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) {
      return `in ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`
    } else if (diffDays < 0) {
      return `vor ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'Tag' : 'Tagen'}`
    } else if (diffHours > 0) {
      return `in ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`
    } else if (diffHours < 0) {
      return `vor ${Math.abs(diffHours)} ${Math.abs(diffHours) === 1 ? 'Stunde' : 'Stunden'}`
    } else if (diffMinutes > 0) {
      return `in ${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minuten'}`
    } else if (diffMinutes < -1) {
      return `vor ${Math.abs(diffMinutes)} ${Math.abs(diffMinutes) === 1 ? 'Minute' : 'Minuten'}`
    } else {
      return 'Gerade eben'
    }
  } catch {
    return ''
  }
}