import type { CookieOptions, Response } from 'express'

import { AUTH_COOKIE_NAME } from '../../config/constants.js'
import { env } from '../../config/env.js'

function getAuthCookieOptions(maxAge?: number): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: env.cookieSameSite,
    secure: env.cookieSecure,
  }

  if (maxAge !== undefined) {
    options.maxAge = maxAge
  }

  return options
}

export function setAuthCookie(response: Response, token: string, maxAge: number) {
  response.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions(maxAge))
}

export function clearAuthCookie(response: Response) {
  response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions())
}
