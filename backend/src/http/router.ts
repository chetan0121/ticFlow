import type { IncomingMessage, ServerResponse } from 'node:http'

import { isHttpError } from './errors.js'
import { sendJson } from './json.js'
import { getRequestUrl } from './url.js'

export type RouteHandler = (
  request: IncomingMessage,
  response: ServerResponse
) => Promise<void> | void

export interface Route {
  method: string
  path: string
  handler: RouteHandler
}

export async function routeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  routes: Route[]
) {
  const url = getRequestUrl(request)
  const route = routes.find(
    item => item.method === request.method && item.path === url.pathname
  )

  if (!route) {
    sendJson(response, 404, { error: 'Not found' })
    return
  }

  try {
    await route.handler(request, response)
  } catch (error) {
    if (isHttpError(error)) {
      sendJson(response, error.statusCode, { error: error.message })
      return
    }

    sendJson(response, 500, { error: 'Internal server error' })
  }
}
