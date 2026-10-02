import { setServers } from 'node:dns'

import { getNewApp } from './app.js'
import env from './config/env.js'
import { closeMongo, connectMongo } from './db/mongo.js'
import { ensureIndexes } from './db/models/index.js'

if (env.dnsServers.length > 0) {
  setServers(env.dnsServers)
}

await connectMongo()
await ensureIndexes()

const app = getNewApp()
const server = app.listen(env.port, () => {
  console.log(`Server is running on port http://localhost:${env.port}`)
})

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`)

  server.close()
  await closeMongo()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
