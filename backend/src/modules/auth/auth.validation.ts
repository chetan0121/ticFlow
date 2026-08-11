import { HttpError } from '../../http/errors.js'
import type { LoginRequest, SignupRequest } from './auth.types.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/

function readStringField(input: Record<string, unknown>, field: string) {
  const value = input[field]

  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} is required`)
  }

  return value.trim()
}

function assertObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'Invalid request body')
  }

  return input as Record<string, unknown>
}

export function validateSignup(input: unknown): SignupRequest {
  const body = assertObject(input)
  const username = readStringField(body, 'username')
  const email = readStringField(body, 'email').toLowerCase()
  const password = readStringField(body, 'password')

  if (!USERNAME_PATTERN.test(username)) {
    throw new HttpError(400, 'Username must be 3-24 letters, numbers, or underscores')
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, 'Email is invalid')
  }

  if (password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters')
  }

  return { username, email, password }
}

export function validateLogin(input: unknown): LoginRequest {
  const body = assertObject(input)
  const email = readStringField(body, 'email').toLowerCase()
  const password = readStringField(body, 'password')

  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, 'Email is invalid')
  }

  return { email, password }
}
