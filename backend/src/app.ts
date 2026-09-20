import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Application } from 'express'
import helmet from 'helmet'

import { env } from './config/env.js'
import { HttpError } from './errors/http-error.js'
import { errorHandler } from './middleware/error-handler.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { healthRouter } from './modules/health/health.routes.js'

function handleCorsOrigin(
  origin: string | undefined,
  callback: (error: Error | null, allowed?: boolean) => void
) {
  if (!origin || env.frontendOrigins.includes(origin)) {
    callback(null, true)
    return
  }

  callback(new HttpError(403, 'Origin not allowed by CORS'))
}

export function createApp(): Application {
  const app = express()

  app.disable('x-powered-by')

  // Global middleware
  app.use(helmet())
  app.use(
    cors({
      credentials: true,
      origin: handleCorsOrigin,
    })
  )

  app.use(express.json({ limit: '32kb' }))
  app.use(cookieParser())

  // Routes handle requests
  app.use('/health', healthRouter)
  app.use('/auth', authRouter)

  // If no route send a response 404
  app.use((_request, response) => {
    response.status(404).json({ error: 'Not found' })
  })

  // Errors passed with next(error) are handled here.
  app.use(errorHandler)

  return app
}
