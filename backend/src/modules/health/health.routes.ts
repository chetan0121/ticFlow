import { Router, type Router as ExpressRouter } from 'express'

import { pingMongo } from '../../db/mongo.js'
import { asyncHandler } from '../../middleware/async-handler.js'

export const healthRouter: ExpressRouter = Router()

healthRouter.get(
  '/',
  asyncHandler(async (_request, response) => {
    try {
      await pingMongo()
      response.status(200).json({ status: 'ok', database: 'connected' })
    } catch {
      response.status(503).json({ status: 'degraded', database: 'disconnected' })
    }
  })
)
