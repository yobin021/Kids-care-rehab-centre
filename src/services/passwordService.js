import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Checks if a string is already a valid bcrypt hash
 */
export function isHashed(str) {
  if (typeof str !== 'string') return false
  return /^\$2[aby]?\$\d{2}\$[./0-9A-Za-z]{53}$/.test(str.trim())
}

/**
 * Hashes a plain-text password using bcrypt (10 rounds)
 * If the input is already hashed, returns it as-is.
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') return ''
  const trimmed = password.trim()
  if (isHashed(trimmed)) return trimmed
  return await bcrypt.hash(trimmed, SALT_ROUNDS)
}

/**
 * Verifies a plain-text password against a stored hash (or legacy plain-text password)
 */
export async function verifyPassword(password, hashOrPlain) {
  if (!password || !hashOrPlain) return false
  const plain = String(password).trim()
  const stored = String(hashOrPlain).trim()

  if (isHashed(stored)) {
    try {
      return await bcrypt.compare(plain, stored)
    } catch (err) {
      console.error('passwordService.verifyPassword compare error:', err)
      return false
    }
  }

  // Backwards compatibility for legacy plain text passwords during migration
  return plain === stored
}

export const passwordService = {
  isHashed,
  hashPassword,
  verifyPassword
}

export default passwordService
