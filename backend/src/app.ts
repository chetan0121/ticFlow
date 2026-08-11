import type { IncomingMessage, ServerResponse } from 'node:http'

import { setCorsHeaders } from './http/json.js'
import { routeRequest, type Route } from './http/router.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { healthRoutes } from './modules/health/health.routes.js'

const routes: Route[] = [...healthRoutes, ...authRoutes]

export async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  setCorsHeaders(response, request.headers.origin)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  await routeRequest(request, response, routes)
}
