import type { Route } from '../../http/router.js'
import { handleLogin, handleLogout, handleMe, handleSignup } from './auth.controller.js'

export const authRoutes: Route[] = [
  { method: 'POST', path: '/auth/signup', handler: handleSignup },
  { method: 'POST', path: '/auth/login', handler: handleLogin },
  { method: 'GET', path: '/auth/me', handler: handleMe },
  { method: 'POST', path: '/auth/logout', handler: handleLogout },
]
