import { createServer } from 'node:http'

import { createApp } from './app.js'
import { env } from './config/env.js'
import { closeMongo, connectMongo } from './db/mongo.js'
import { ensureSessionIndexes } from './db/models/session.model.js'
import { ensureUserIndexes } from './db/models/user.model.js'

const app = createApp()
const server = createServer(app)

let isShuttingDown = false

async function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) return

  isShuttingDown = true
  console.log(`Received ${signal}. Shutting down gracefully...`)

  try {
    await new Promise<void>((resolve, reject) => {
      server.close(error => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
    await closeMongo()
    console.log('Backend shutdown complete')
  } catch (error) {
    console.error('Graceful shutdown failed', error)
    process.exitCode = 1
  }
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))

try {
  await connectMongo()
  await Promise.all([ensureUserIndexes(), ensureSessionIndexes()])

  server.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`)
  })
} catch (error) {
  console.error('Backend startup failed', error)
  await closeMongo()
  process.exitCode = 1
}
