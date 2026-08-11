import type { IncomingMessage, ServerResponse } from 'node:http'

import { env } from '../config/env.js'

export function getCookie(request: IncomingMessage, name: string) {
  const cookieHeader = request.headers.cookie
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map(cookie => cookie.trim())
  const target = cookies.find(cookie => cookie.startsWith(`${name}=`))

  if (!target) return null

  return decodeURIComponent(target.slice(name.length + 1))
}

export function setCookie(
  response: ServerResponse,
  name: string,
  value: string,
  maxAgeSeconds: number
) {
  const secure = env.cookieSecure ? '; Secure' : ''

  response.setHeader(
    'Set-Cookie',
    `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; SameSite=Lax${secure}`
  )
}

export function clearCookie(response: ServerResponse, name: string) {
  const secure = env.cookieSecure ? '; Secure' : ''

  response.setHeader(
    'Set-Cookie',
    `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure}`
  )
}
