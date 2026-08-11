import type { IncomingMessage, ServerResponse } from 'node:http'

import { AUTH_COOKIE_NAME } from '../../config/constants.js'
import { readJsonBody } from '../../http/body.js'
import { clearCookie, getCookie, setCookie } from '../../http/cookies.js'
import { HttpError } from '../../http/errors.js'
import { sendJson } from '../../http/json.js'
import {
  getCurrentUser,
  login,
  logout,
  signup,
  type AuthSessionResult,
} from './auth.service.js'
import { validateLogin, validateSignup } from './auth.validation.js'

function sendAuthSession(
  response: ServerResponse,
  result: AuthSessionResult,
  statusCode = 200
) {
  setCookie(response, result.cookieName, result.token, result.maxAgeSeconds)
  sendJson(response, statusCode, { user: result.user })
}

export async function handleSignup(request: IncomingMessage, response: ServerResponse) {
  const body = await readJsonBody(request)
  const result = await signup(validateSignup(body))

  sendAuthSession(response, result, 201)
}

export async function handleLogin(request: IncomingMessage, response: ServerResponse) {
  const body = await readJsonBody(request)
  const result = await login(validateLogin(body))

  sendAuthSession(response, result)
}

export async function handleMe(request: IncomingMessage, response: ServerResponse) {
  const token = getCookie(request, AUTH_COOKIE_NAME)

  if (!token) {
    throw new HttpError(401, 'Unauthorized')
  }

  const result = await getCurrentUser(token)

  sendAuthSession(response, result)
}

export async function handleLogout(request: IncomingMessage, response: ServerResponse) {
  try {
    await logout(getCookie(request, AUTH_COOKIE_NAME))
  } catch {
    // Logout should still clear a stale or malformed cookie.
  }

  clearCookie(response, AUTH_COOKIE_NAME)
  sendJson(response, 200, { status: 'ok' })
}
