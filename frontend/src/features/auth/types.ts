export interface AuthUser {
  id: string
  username: string
  email: string
}

export interface AuthResponse {
  user: AuthUser
}

export type AuthMode = 'login' | 'signup'
