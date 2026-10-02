import type { Request, Response } from 'express'

import { getAuthUser, getSessionToken, type AuthLocals } from '../../middleware/auth.js'
import { clearAuthCookie, setAuthCookie } from './cookies.js'
import { login, logout, signup } from './services.js'
import { validateLogin, validateSignup } from './validation.js'

export async function signupController(request: Request, response: Response): Promise<void> {
  const input = validateSignup(request.body)
  const result = await signup(input)

  setAuthCookie(response, result.token, result.cookieMaxAge)

  response.status(201).json({ user: result.user })
}

export async function loginController(request: Request, response: Response): Promise<void> {
  const input = validateLogin(request.body)
  const result = await login(input)

  setAuthCookie(response, result.token, result.cookieMaxAge)

  response.status(200).json({ user: result.user })
}

export function meController(_request: Request, response: Response<unknown, AuthLocals>): void {
  response.status(200).json({ user: getAuthUser(response) })
}

export async function logoutController(request: Request, response: Response): Promise<void> {
  await logout(getSessionToken(request))
  clearAuthCookie(response)

  response.status(204).end()
}
