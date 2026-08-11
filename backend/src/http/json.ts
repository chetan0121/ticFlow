import type { ServerResponse } from 'node:http'

import { env } from '../config/env.js'

export function setCorsHeaders(response: ServerResponse) {
  response.setHeader('Access-Control-Allow-Origin', env.frontendOrigin)
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
}

export function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  setCorsHeaders(response)
  response.writeHead(statusCode, { 'content-type': 'application/json' })
  response.end(JSON.stringify(body))
}
