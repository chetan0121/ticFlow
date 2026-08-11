import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url')
  const key = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer

  return `scrypt:${salt}:${key.toString('base64url')}`
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedKey] = passwordHash.split(':')

  if (algorithm !== 'scrypt' || !salt || !storedKey) {
    return false
  }

  const storedBuffer = Buffer.from(storedKey, 'base64url')
  const key = (await scryptAsync(password, salt, storedBuffer.length)) as Buffer

  return storedBuffer.length === key.length && timingSafeEqual(storedBuffer, key)
}
