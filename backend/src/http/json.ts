import type { ServerResponse } from 'node:http'

import { env } from '../config/env.js'

function isLocalhostOrigin(origin: string) {
  try {
    const url = new URL(origin)

    return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  } catch {
    return false
  }
}

export function setCorsHeaders(response: ServerResponse, origin?: string) {
  const allowedOrigin =
    origin && (isLocalhostOrigin(origin) || env.frontendOrigins.includes(origin))
      ? origin
      : 'http://localhost:5173'

  response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  response.setHeader('Vary', 'Origin')
}

export function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  if (!response.hasHeader('Access-Control-Allow-Origin')) {
    setCorsHeaders(response)
  }

  response.writeHead(statusCode, { 'content-type': 'application/json' })
  response.end(JSON.stringify(body))
}
