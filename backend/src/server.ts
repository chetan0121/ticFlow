import { setServers } from 'node:dns'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

import { getNewApp } from './app.js'
import env from './config/env.js'
import { closeMongo, connectMongo } from './db/mongo.js'
import { ensureIndexes } from './db/models/index.js'
import { isOriginAllowed } from './config/env.js'
import { attachFriendGameSocket } from './modules/friend-game/socket.js'

if (env.dnsServers.length > 0) {
  setServers(env.dnsServers)
}

await connectMongo()
await ensureIndexes()

const app = getNewApp()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
    credentials: true,
  },
  allowRequest: (request, callback) => {
    const origin = request.headers.origin
    callback(null, !origin || isOriginAllowed(origin))
  },
})

attachFriendGameSocket(io)

server.listen(env.port, '0.0.0.0', () => {
  console.log(`Server is listening on http://0.0.0.0:${env.port}`)
})

let shuttingDown = false

function closeServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(error => {
      if (error) reject(error)
      else resolve()
    })
  })
}

async function shutdown(reason: string, exitCode = 0): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`${reason}, shutting down`)

  try {
    await io.close()
    await closeServer()
    await closeMongo()
  } catch (error) {
    console.error('Error during graceful shutdown', error)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
}

process.on('SIGINT', () => {
  shutdown('SIGINT').catch(error => {
    console.error('SIGINT shutdown failed', error)
    process.exit(1)
  })
})
process.on('SIGTERM', () => {
  shutdown('SIGTERM').catch(error => {
    console.error('SIGTERM shutdown failed', error)
    process.exit(1)
  })
})
process.on('unhandledRejection', reason => {
  console.error('Unhandled promise rejection', reason)
  shutdown('Unhandled promise rejection', 1).catch(error => {
    console.error('Unhandled rejection shutdown failed', error)
    process.exit(1)
  })
})
process.on('uncaughtException', error => {
  console.error('Uncaught exception', error)
  shutdown('Uncaught exception', 1).catch(shutdownError => {
    console.error('Uncaught exception shutdown failed', shutdownError)
    process.exit(1)
  })
})
