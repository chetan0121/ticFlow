import { Router } from 'express'
import { getDb } from '../../db/mongo.js'

const router: Router = Router()

router.get('/health', async (_req, res) => {
  const isConnected = !!(await getDb())

  res.status(200).json({
    status: 'ok',
    mongoDB: isConnected ? 'connected' : 'not connected',
  })
})

export default router
