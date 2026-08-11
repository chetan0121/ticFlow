import { createHmac, timingSafeEqual } from 'node:crypto'

import { env } from '../../config/env.js'
import { HttpError } from '../../http/errors.js'
import type { AuthTokenPayload } from './auth.types.js'

function encodeBase64Url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function sign(input: string) {
  return createHmac('sha256', env.jwtSecret).update(input).digest('base64url')
}

export function createAuthToken(payload: AuthTokenPayload) {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = encodeBase64Url(JSON.stringify(payload))
  const signature = sign(`${header}.${body}`)

  return `${header}.${body}.${signature}`
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const [header, body, signature] = token.split('.')

  if (!header || !body || !signature) {
    throw new HttpError(401, 'Invalid session')
  }

  const expectedSignature = sign(`${header}.${body}`)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new HttpError(401, 'Invalid session')
  }

  const payload = JSON.parse(decodeBase64Url(body)) as Partial<AuthTokenPayload>
  const nowSeconds = Math.floor(Date.now() / 1000)

  if (!payload.sessionId || !payload.userId || !payload.exp || payload.exp <= nowSeconds) {
    throw new HttpError(401, 'Session expired')
  }

  return payload as AuthTokenPayload
}
