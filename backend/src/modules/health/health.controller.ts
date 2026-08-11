import type { ServerResponse } from 'node:http'

import { pingMongo } from '../../db/mongo.js'
import { sendJson } from '../../http/json.js'

export async function handleHealth(response: ServerResponse) {
  try {
    await pingMongo()

    sendJson(response, 200, { status: 'ok', database: 'connected' })
  } catch {
    sendJson(response, 503, { status: 'degraded', database: 'disconnected' })
  }
}
