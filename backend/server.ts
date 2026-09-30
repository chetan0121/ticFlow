import { setServers } from 'node:dns'
import { getNewApp } from './src/app'
import env from './src/config/env'

if (env.dnsServers.length > 0) {
  setServers(env.dnsServers)
}

const app = getNewApp()

app.listen(env.port, () => {
  console.log(`Server is running on port http://localhost:${env.port}`)
})
