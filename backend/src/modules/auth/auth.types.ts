import type { PublicUser } from '../../db/models/user.model.js'

export interface SignupRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  identifier: string
  password: string
}

export interface AuthTokenPayload {
  sessionId: string
  userId: string
}

export interface AuthSessionResult {
  cookieMaxAgeMs: number
  refreshed: boolean
  token: string
  user: PublicUser
}
