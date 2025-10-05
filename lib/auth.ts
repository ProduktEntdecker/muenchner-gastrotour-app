import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
// import { prisma } from './db' // TODO: Convert to Supabase
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this'

export interface JWTPayload {
  userId: number
  email: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateMagicLinkToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = generateMagicLinkToken()
  // TODO: Convert to Supabase implementation
  /*
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.authToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  })
  */
  return token
}

export async function validateMagicLinkToken(token: string) {
  // TODO: Convert to Supabase implementation
  /*
  const authToken = await prisma.authToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!authToken) {
    return { valid: false, error: 'Token nicht gefunden' }
  }

  if (authToken.usedAt) {
    return { valid: false, error: 'Token wurde bereits verwendet' }
  }

  if (authToken.expiresAt < new Date()) {
    return { valid: false, error: 'Token ist abgelaufen' }
  }

  // Mark token as used
  await prisma.authToken.update({
    where: { id: authToken.id },
    data: { usedAt: new Date() },
  })

  return { valid: true, email: authToken.email, user: authToken.user }
  */
  return { valid: false, error: 'Magic link validation temporarily disabled during simplification' }
}
