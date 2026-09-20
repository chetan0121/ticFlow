import type { Request, Response } from 'express'

import { AUTH_COOKIE_NAME } from '../../config/constants.js'
import type { AuthenticatedLocals } from '../../middleware/authenticate.js'
import { clearAuthCookie, setAuthCookie } from './cookies.js'
import { login, logout, signup } from './auth.service.js'
import type { AuthSessionResult } from './auth.types.js'
import { validateLogin, validateSignup } from './auth.validation.js'

function sendAuthSession(response: Response, result: AuthSessionResult, statusCode = 200) {
  setAuthCookie(response, result.token, result.cookieMaxAgeMs)
  response.status(statusCode).json({ user: result.user })
}

export async function handleSignup(request: Request, response: Response) {
  const result = await signup(validateSignup(request.body))

  sendAuthSession(response, result, 201)
}

export async function handleLogin(request: Request, response: Response) {
  const result = await login(validateLogin(request.body))

  sendAuthSession(response, result)
}

export function handleMe(_request: Request, response: Response<unknown, AuthenticatedLocals>) {
  const result = response.locals.auth

  response.status(200).json({ user: result.user })
}

export async function handleLogout(request: Request, response: Response) {
  try {
    await logout(request.cookies[AUTH_COOKIE_NAME] as string | undefined)
  } catch {
    // Logout should still clear a stale, expired, or malformed client cookie.
  }

  clearAuthCookie(response)
  response.status(200).json({ status: 'ok' })
}
