import type { Route } from '../../http/router.js'
import { handleHealth } from './health.controller.js'

export const healthRoutes: Route[] = [
  { method: 'GET', path: '/health', handler: (_request, response) => handleHealth(response) },
]
