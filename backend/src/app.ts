import type { Express } from 'express'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/error-handler.js'
import healthRouter from './modules/health/routes.js'
import { isOriginAllowed } from './config/env.js'
import authRouter from './modules/auth/routes.js'

export function getNewApp() {
  const app: Express = express()
  app.disable('x-powered-by')

  // Security middleware
  app.use(helmet())
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
    })
  )
  app.use(cookieParser())

  // Request body parsers
  app.use(express.json({ limit: '32kb' }))
  app.use(express.urlencoded({ extended: true }))

  // routes
  app.use('/api', healthRouter)
  app.use('/api', authRouter)

  // Invalid path
  app.use((_req, res) => {
    res.status(404).json({ error: 'Invalid path' })
  })

  // Error handler (must be last)
  app.use(errorHandler)

  return app
}
