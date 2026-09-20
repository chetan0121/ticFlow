import type { NextFunction, Request, Response } from 'express'

import { AUTH_COOKIE_NAME } from '../config/constants.js'
import { HttpError } from '../errors/http-error.js'
import { setAuthCookie } from '../modules/auth/cookies.js'
import { getCurrentUser } from '../modules/auth/auth.service.js'
import type { AuthSessionResult } from '../modules/auth/auth.types.js'

export interface AuthenticatedLocals {
  auth: AuthSessionResult
}

export async function authenticate(
  request: Request,
  response: Response<unknown, Partial<AuthenticatedLocals>>,
  next: NextFunction
) {
  try {
    const token = request.cookies[AUTH_COOKIE_NAME] as string | undefined

    if (!token) {
      throw new HttpError(401, 'Unauthorized')
    }

    const auth = await getCurrentUser(token)

    if (auth.refreshed) {
      setAuthCookie(response, auth.token, auth.cookieMaxAgeMs)
    }

    response.locals.auth = auth
    next()
  } catch (error) {
    next(error)
  }
}
