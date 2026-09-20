import jwt from 'jsonwebtoken'

import { env } from '../../config/env.js'
import { HttpError } from '../../errors/http-error.js'
import type { AuthTokenPayload } from './auth.types.js'

function isAuthTokenPayload(payload: unknown): payload is AuthTokenPayload {
  if (!payload || typeof payload !== 'object') return false

  const value = payload as Partial<AuthTokenPayload>

  return typeof value.sessionId === 'string' && typeof value.userId === 'string'
}

export function createAuthToken(payload: AuthTokenPayload, expiresInSeconds: number) {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: expiresInSeconds,
  })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
    })

    if (!isAuthTokenPayload(payload)) {
      throw new HttpError(401, 'Invalid session')
    }

    return payload
  } catch (error) {
    if (error instanceof HttpError) throw error

    throw new HttpError(401, 'Invalid session')
  }
}
