import jwt from 'jsonwebtoken'

import { JWT_ALGORITHM } from '../../config/constants.js'
import env from '../../config/env.js'
import { HttpError } from '../../errors/http-errors.js'
import type { AuthTokenPayload } from './types.js'

const MILLISECONDS_PER_SECOND = 1000

function isAuthTokenPayload(payload: unknown): payload is AuthTokenPayload {
  if (!payload || typeof payload !== 'object') return false

  const value = payload as Partial<AuthTokenPayload>

  return typeof value.sessionId === 'string'
}

export function createAuthToken(payload: AuthTokenPayload, lifetimeMs: number): string {
  const expiresIn = Math.max(1, Math.floor(lifetimeMs / MILLISECONDS_PER_SECOND))

  return jwt.sign(payload, env.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn,
  })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const payload: unknown = jwt.verify(token, env.jwtSecret, {
      algorithms: [JWT_ALGORITHM],
    })

    if (!isAuthTokenPayload(payload)) {
      throw HttpError.unauthorized('Invalid session')
    }

    return payload
  } catch (error) {
    if (error instanceof HttpError) throw error

    throw HttpError.unauthorized('Invalid session')
  }
}
