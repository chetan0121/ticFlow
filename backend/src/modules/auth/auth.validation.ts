import { HttpError } from '../../errors/http-error.js'
import type { LoginRequest, SignupRequest } from './auth.types.js'

type RequestBody = Record<string, unknown>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/
const MAX_PASSWORD_LENGTH = 128

function assertBody(input: unknown): RequestBody {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'Invalid request body')
  }

  return input as RequestBody
}

function readString(input: RequestBody, field: string) {
  const value = input[field]

  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} is required`)
  }

  return value.trim()
}

function validatePassword(password: string) {
  if (password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters')
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new HttpError(400, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`)
  }
}

export function validateSignup(input: unknown): SignupRequest {
  const body = assertBody(input)
  const username = readString(body, 'username').toLowerCase()
  const email = readString(body, 'email').toLowerCase()
  const password = readString(body, 'password')

  if (!USERNAME_PATTERN.test(username)) {
    throw new HttpError(400, 'Username must be 3-24 letters, numbers, or underscores')
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, 'Email is invalid')
  }

  validatePassword(password)

  return { username, email, password }
}

export function validateLogin(input: unknown): LoginRequest {
  const body = assertBody(input)
  const identifier = readString(body, 'identifier').toLowerCase()
  const password = readString(body, 'password')

  if (!EMAIL_PATTERN.test(identifier) && !USERNAME_PATTERN.test(identifier)) {
    throw new HttpError(400, 'Email or username is invalid')
  }

  validatePassword(password)

  return { identifier, password }
}
