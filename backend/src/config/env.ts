import 'dotenv/config'

const DEFAULT_PORT = 3000
const DEFAULT_FRONTEND_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

function readRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function readPort() {
  const value = process.env.PORT

  if (!value) return DEFAULT_PORT

  const port = Number(value)

  if (!Number.isSafeInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid port number')
  }

  return port
}

function readBooleanEnv(name: string, defaultValue: boolean) {
  const value = process.env[name]

  if (!value) return defaultValue

  if (value !== 'true' && value !== 'false') {
    throw new Error(`${name} must be true or false`)
  }

  return value === 'true'
}

function readListEnv(name: string, fallback: string[] = []) {
  const value = process.env[name]

  if (!value) return fallback

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function readCookieSameSite(): 'lax' | 'strict' | 'none' {
  const value = process.env.COOKIE_SAME_SITE ?? 'lax'

  if (value !== 'lax' && value !== 'strict' && value !== 'none') {
    throw new Error('COOKIE_SAME_SITE must be lax, strict, or none')
  }

  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readPort(),
  frontendOrigins: Array.from(
    new Set(readListEnv('FRONTEND_ORIGINS', DEFAULT_FRONTEND_ORIGINS))
  ),
  dnsServers: readListEnv('DNS_SERVERS'),
  mongoUri: readRequiredEnv('MONGODB_URI'),
  mongoDbName: readRequiredEnv('MONGODB_DB_NAME'),
  jwtSecret: readRequiredEnv('JWT_SECRET'),
  cookieSecure: readBooleanEnv('COOKIE_SECURE', false),
  cookieSameSite: readCookieSameSite(),
}
