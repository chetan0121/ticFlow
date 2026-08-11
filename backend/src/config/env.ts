const DEFAULT_PORT = 3000

function readRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function readPort(): number {
  const value = process.env.PORT

  if (!value) return DEFAULT_PORT

  const port = Number(value)

  if (!Number.isSafeInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid port number')
  }

  return port
}

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]

  if (!value) return defaultValue

  return value === 'true'
}

function readListEnv(name: string): string[] {
  const value = process.env[name]

  if (!value) return []

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export const env = {
  port: readPort(),
  frontendOrigins: Array.from(new Set(readListEnv('FRONTEND_ORIGINS'))),
  dnsServers: process.env.DNS_SERVERS?.split(',')
    .map(server => server.trim())
    .filter(Boolean) ?? ['1.1.1.1', '1.0.0.1'],
  mongoUri: readRequiredEnv('MONGODB_URI'),
  mongoDbName: readRequiredEnv('MONGODB_DB_NAME'),
  jwtSecret: readRequiredEnv('JWT_SECRET'),
  cookieSecure: readBooleanEnv('COOKIE_SECURE', false),
}
