import { Router } from 'express'
import mongoose from 'mongoose'

import { getConnectionState } from '../../db/mongo.js'

const router: Router = Router()

router.get('/health', (_req, res) => {
  const isConnected = getConnectionState() === mongoose.ConnectionStates.connected

  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'ok' : 'degraded',
    mongoDB: isConnected ? 'connected' : 'not connected',
  })
})

export default router
