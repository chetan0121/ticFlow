export interface AuthTokenPayload {
  sessionId: string
}

export interface PublicUser {
  id: string
  username: string
  email: string
}

export interface SignupInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  identifier: string
  password: string
}

export interface AuthResult {
  user: PublicUser
  token: string
  cookieMaxAge: number
}

export interface SessionResult {
  user: PublicUser
  sessionId: string
  token: string
  cookieMaxAge: number
  refreshed: boolean
}
