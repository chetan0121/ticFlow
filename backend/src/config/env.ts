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

function fetchMongoURI(): string {
  const uri = fetchEnv('MONGODB_URI')
  const dbName = fetchEnv('MONGODB_DB_NAME')

  const baseUri = uri.endsWith('/') ? uri : `${uri}/`
  return `${baseUri}${dbName}`
}

const env = {
  devMode: readBooleanEnv('DEV_MODE'),
  port: readPort(),
  frontendOrigins: cleanRepeated(readListEnv('FRONTEND_ORIGINS')),
  dnsServers: cleanRepeated(readListEnv('DNS_SERVERS')),
  mongoUri: fetchMongoURI(),
  jwtSecret: fetchEnv('JWT_SECRET'),
}

if (!env.devMode) {
  if (env.frontendOrigins.length === 0) {
    throw new Error('FRONTEND_ORIGINS must include an HTTPS origin when DEV_MODE=false')
  }

  for (const origin of env.frontendOrigins) {
    let parsedOrigin: URL
    try {
      parsedOrigin = new URL(origin)
    } catch {
      throw new Error(`FRONTEND_ORIGINS contains an invalid origin: ${origin}`)
    }

    if (parsedOrigin.protocol !== 'https:' || parsedOrigin.origin !== origin) {
      throw new Error(
        `FRONTEND_ORIGINS must contain exact HTTPS origins in production: ${origin}`
      )
    }
  }
}

export function isOriginAllowed(origin: string | undefined): boolean {
  // Development mode deliberately permits LAN and local origins.
  if (env.devMode) return true
  if (!origin) return false

  return env.frontendOrigins.includes(origin)
}

export default env
