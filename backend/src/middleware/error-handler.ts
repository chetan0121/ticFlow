import type { ErrorRequestHandler } from 'express'

import { env } from '../config/env.js'
import { isHttpError } from '../errors/http-error.js'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400 &&
    'body' in error
  ) {
    response.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  if (isHttpError(error)) {
    response.status(error.statusCode).json({ error: error.message })
    return
  }

  if (env.nodeEnv !== 'test') {
    console.error(error)
  }

  response.status(500).json({ error: 'Internal server error' })
}
