import { createServer } from 'node:http'

import { handleRequest } from './app.js'
import { env } from './config/env.js'

const server = createServer((request, response) => {
  void handleRequest(request, response)
})

server.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`)
})
