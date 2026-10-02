import {
  EMAIL_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from '../../config/constants.js'
import { HttpError } from '../../errors/http-errors.js'
import type { LoginInput, SignupInput } from './types.js'

type RequestBody = Record<string, unknown>

function assertBody(input: unknown): RequestBody {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw HttpError.badRequest('Invalid request body')
  }

  return input as RequestBody
}

function readString(input: RequestBody, field: string): string {
  const value = input[field]

  if (typeof value !== 'string') {
    throw HttpError.badRequest(`${field} is required`)
  }

  return value.trim()
}

function readPassword(input: RequestBody): string {
  const value = input.password

  if (typeof value !== 'string' || value.length === 0) {
    throw HttpError.badRequest('password is required')
  }

  return value
}

function validatePassword(password: string): void {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw HttpError.badRequest(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw HttpError.badRequest(`Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  }
}

function validateUsername(username: string): void {
  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    throw HttpError.badRequest(
      `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters`
    )
  }

  if (!USERNAME_PATTERN.test(username)) {
    throw HttpError.badRequest('Username can only contain letters, numbers, or underscores')
  }
}

export function validateSignup(input: unknown): SignupInput {
  const body = assertBody(input)
  const username = readString(body, 'username').toLowerCase()
  const email = readString(body, 'email').toLowerCase()
  const password = readPassword(body)

  validateUsername(username)

  if (!EMAIL_PATTERN.test(email)) {
    throw HttpError.badRequest('Email is invalid')
  }

  validatePassword(password)

  return { username, email, password }
}

export function validateLogin(input: unknown): LoginInput {
  const body = assertBody(input)
  const identifier = readString(body, 'identifier').toLowerCase()
  const password = readPassword(body)

  if (!EMAIL_PATTERN.test(identifier) && !USERNAME_PATTERN.test(identifier)) {
    throw HttpError.badRequest('Enter a valid email or username')
  }

  return { identifier, password }
}
