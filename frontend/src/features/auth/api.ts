import type { AuthResponse } from './types'

const API_BASE_URL = `${globalThis.location.protocol}//${globalThis.location.hostname}:3000`

async function requestAuth(path: string, options: RequestInit = {}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = (await response.json()) as Partial<AuthResponse> & { error?: string }

  if (!response.ok || !body.user) {
    throw new Error(body.error ?? 'Authentication failed')
  }

  return { user: body.user }
}

export function signup(username: string, email: string, password: string) {
  return requestAuth('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

export function login(identifier: string, password: string) {
  return requestAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })
}

export function getMe() {
  return requestAuth('/auth/me')
}

export async function logout() {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
