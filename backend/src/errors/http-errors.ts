export class HttpError extends Error {
  readonly _tag = 'HttpError'

  constructor(code: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.code = code

    if (typeof Error !== 'undefined' && 'captureStackTrace' in Error) {
      Error.captureStackTrace(this, HttpError)
    }
  }

  code: number

  static badRequest(msg = 'Bad request'): HttpError {
    return new HttpError(400, msg)
  }

  static unauthorized(msg = 'Unauthorized'): HttpError {
    return new HttpError(401, msg)
  }

  static forbidden(msg = 'Forbidden'): HttpError {
    return new HttpError(403, msg)
  }

  static notFound(msg = 'Not found'): HttpError {
    return new HttpError(404, msg)
  }

  static conflict(msg = 'Conflict'): HttpError {
    return new HttpError(409, msg)
  }

  static unprocessable(msg = 'Unprocessable entity'): HttpError {
    return new HttpError(422, msg)
  }

  static tooManyRequests(msg = 'Too many requests'): HttpError {
    return new HttpError(429, msg)
  }

  static internal(msg = 'Internal server error'): HttpError {
    return new HttpError(500, msg)
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return (
    error instanceof Error && 'code' in error && (error as { code: unknown }).code !== undefined
  )
}
