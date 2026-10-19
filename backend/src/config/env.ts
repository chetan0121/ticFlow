import 'dotenv/config'

function fetchEnv(name: string, defaultValue: string = ''): string {
  const value = process.env[name]?.trim()

  if (!value) {
    if (defaultValue) return defaultValue
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function readPort(defaultValue: number = 3000): number {
  const value = process.env.PORT?.trim()

  if (!value) return defaultValue

  const port = Number(value)

  if (!Number.isSafeInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid port number')
  }

  return port
}

function readBooleanEnv(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name]?.trim().toLowerCase()

  if (!value) return defaultValue

  if (value !== 'true' && value !== 'false') {
    throw new Error(`${name} must be true or false`)
  }

  return value === 'true'
}

function readListEnv(name: string, fallback: string[] = []): string[] {
  const value = process.env[name]

  if (!value) return fallback

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function cleanRepeated(values: string[]): string[] {
  return Array.from(new Set(values))
}

function readCookieSameSite(): 'lax' | 'strict' | 'none' {
  const value = process.env.COOKIE_SAME_SITE?.trim().toLowerCase() || 'lax'

  if (value !== 'lax' && value !== 'strict' && value !== 'none') {
    throw new Error('COOKIE_SAME_SITE must be lax, strict, or none')
  }

  return value
}

function fetchMongoURI(): string {
  const uri = fetchEnv('MONGODB_URI')
  const dbName = fetchEnv('MONGODB_DB_NAME')

  const baseUri = uri.endsWith('/') ? uri : `${uri}/`
  return `${baseUri}${dbName}`
}

const env = {
  debugMode: readBooleanEnv('DEBUG_MODE'),
  port: readPort(),
  frontendOrigins: cleanRepeated(readListEnv('FRONTEND_ORIGINS')),
  dnsServers: cleanRepeated(readListEnv('DNS_SERVERS')),
  mongoUri: fetchMongoURI(),
  jwtSecret: fetchEnv('JWT_SECRET'),
  cookieSecure: readBooleanEnv('COOKIE_SECURE'),
  cookieSameSite: readCookieSameSite(),
}

export function isOriginAllowed(origin: string | undefined): boolean {
  // LAN origins vary by device, so development mode deliberately permits them.
  // Keep DEBUG_MODE disabled outside local development.
  if (env.debugMode) return true
  if (!origin) return false

  if (env.frontendOrigins.includes(origin)) return true

  try {
    const hostname = new URL(origin).hostname.toLowerCase()
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export default env
