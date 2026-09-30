import type { Request, Response, NextFunction } from 'express'
import env from '../config/env.js'
import { isHttpError } from '../errors/http-errors.js'

function isJsonSyntaxError(error: unknown): boolean {
  if (!(error instanceof SyntaxError)) return false

  const type = (error as SyntaxError & { type?: string }).type

  return type === 'entity.parse.failed'
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // JSON body parse errors (express.json throws SyntaxError)
  if (isJsonSyntaxError(error)) {
    res.status(400).json({ error: 'Invalid JSON in request body' })
    return
  }

  // Known HttpError thrown by our code
  if (isHttpError(error)) {
    res.status(error.code).json({ error: error.message })
    return
  }

  // Framework errors with a numeric status property
  if (error instanceof Error && 'status' in error) {
    const status = (error as { status: number }).status
    if (typeof status === 'number' && status >= 400 && status < 600) {
      res.status(status).json({ error: error.message })
      return
    }
  }

  // Unexpected errors
  const message = !env.debugMode
    ? 'Internal server error'
    : error instanceof Error
      ? error.message
      : String(error)

  if (env.debugMode) {
    console.error('[errorHandler]', error)
  }

  res.status(500).json({ error: message })
}

export default errorHandler
