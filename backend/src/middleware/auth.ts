import type { NextFunction, Request, Response } from 'express'

import { AUTH_COOKIE_NAME } from '../config/constants.js'
import { HttpError } from '../errors/http-errors.js'
import { setAuthCookie } from '../modules/auth/cookies.js'
import { getSession } from '../modules/auth/services.js'
import type { PublicUser } from '../modules/auth/types.js'

export interface AuthSession {
  user: PublicUser
  sessionId: string
}

/**
 * `auth` is optional because locals start empty and only `requireAuth` fills it
 * in, so a handler reached without that middleware sees `undefined`.
 */
export type AuthLocals = {
  auth?: AuthSession
}

export function getSessionToken(request: Request): string | undefined {
  const cookies = request.cookies as Record<string, string | undefined> | undefined
  const token = cookies?.[AUTH_COOKIE_NAME]

  return typeof token === 'string' && token.length > 0 ? token : undefined
}

export function requireAuth(
  request: Request,
  response: Response<unknown, AuthLocals>,
  next: NextFunction
): void {
  const token = getSessionToken(request)

  if (!token) {
    next(HttpError.unauthorized('Unauthorized'))
    return
  }

  getSession(token)
    .then(session => {
      if (session.refreshed) {
        setAuthCookie(response, session.token, session.cookieMaxAge)
      }

      response.locals.auth = { user: session.user, sessionId: session.sessionId }
      next()
    })
    .catch(next)
}

export function getAuthSession(response: Response<unknown, AuthLocals>): AuthSession {
  const auth = response.locals.auth

  if (!auth) {
    throw HttpError.unauthorized('Unauthorized')
  }

  return auth
}

export function getAuthUser(response: Response<unknown, AuthLocals>): PublicUser {
  return getAuthSession(response).user
}
