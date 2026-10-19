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
  allowRequest: (request, callback) => callback(null, isOriginAllowed(request.headers.origin)),
})

attachFriendGameSocket(io)

server.listen(env.port, '0.0.0.0', () => {
  console.log(`Server is listening on http://0.0.0.0:${env.port}`)
})

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`)

  void io.close()
  server.close()
  await closeMongo()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
