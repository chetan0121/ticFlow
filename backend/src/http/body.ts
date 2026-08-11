import type { IncomingMessage } from 'node:http'

import { HttpError } from './errors.js'

const MAX_BODY_SIZE = 1024 * 1024

export async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = []
  let size = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length

    if (size > MAX_BODY_SIZE) {
      throw new Error('Request body is too large')
    }

    chunks.push(buffer)
  }

  if (chunks.length === 0) return {}

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
  } catch {
    throw new HttpError(400, 'Invalid JSON body')
  }
}
