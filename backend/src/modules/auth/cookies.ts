import type { CookieOptions, Response } from 'express'

import { AUTH_COOKIE_NAME } from '../../config/constants.js'
import env from '../../config/env.js'

function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    path: '/',
    sameSite: env.cookieSameSite,
    secure: env.cookieSecure,
  }
}

export function setAuthCookie(response: Response, token: string, maxAge: number): void {
  response.cookie(AUTH_COOKIE_NAME, token, { ...getCookieOptions(), maxAge })
}

export function clearAuthCookie(response: Response): void {
  response.clearCookie(AUTH_COOKIE_NAME, getCookieOptions())
}
