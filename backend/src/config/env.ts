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

function normalizeFrontendOrigin(value: string, requireHttps: boolean): string {
  let parsedOrigin: URL

  try {
    parsedOrigin = new URL(value)
  } catch {
    throw new Error(`FRONTEND_ORIGINS contains an invalid URL: ${value}`)
  }

  if (parsedOrigin.protocol !== 'http:' && parsedOrigin.protocol !== 'https:') {
    throw new Error(`FRONTEND_ORIGINS must use HTTP or HTTPS: ${value}`)
  }

  if (requireHttps && parsedOrigin.protocol !== 'https:') {
    throw new Error(`FRONTEND_ORIGINS must contain HTTPS URLs in production: ${value}`)
  }

  return parsedOrigin.origin
}

function fetchFrontendOrigins(): string[] {
  const devMode = readBooleanEnv('DEV_MODE')

  return cleanRepeated(
    readListEnv('FRONTEND_ORIGINS').map(origin => normalizeFrontendOrigin(origin, !devMode))
  )
}

function fetchMongoURI(): string {
  const uri = fetchEnv('MONGODB_URI')
  const dbName = fetchEnv('MONGODB_DB_NAME')

  const baseUri = uri.endsWith('/') ? uri : `${uri}/`
  return `${baseUri}${dbName}`
}

const env = {
  devMode: readBooleanEnv('DEV_MODE'),
  port: readPort(),
  frontendOrigins: fetchFrontendOrigins(),
  dnsServers: cleanRepeated(readListEnv('DNS_SERVERS')),
  mongoUri: fetchMongoURI(),
  jwtSecret: fetchEnv('JWT_SECRET'),
}

if (!env.devMode && env.frontendOrigins.length === 0) {
  throw new Error('FRONTEND_ORIGINS must include an HTTPS origin when DEV_MODE=false')
}

export function isOriginAllowed(origin: string | undefined): boolean {
  // Development mode deliberately permits LAN and local origins.
  if (env.devMode) return true
  if (!origin) return false

  return env.frontendOrigins.includes(origin)
}

export default env
