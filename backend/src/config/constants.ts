export const AUTH_COOKIE_NAME = 'ticflow_session'

// Milliseconds in a day
export const DAY_MS = 24 * 60 * 60 * 1000

// Sessions idle-expire after 7 days
export const SESSION_TTL_MS = 7 * DAY_MS

// Sessions are rejected once they pass 90 days, regardless of activity
export const SESSION_HARD_TTL_MS = 90 * DAY_MS

// Friend games expire one day after their last persisted update
export const FRIEND_GAME_TTL_SECONDS = DAY_MS / 1000

// Regex patterns for validating usernames and emails
export const USERNAME_PATTERN = /^[a-z0-9_]+$/
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Length constraints for usernames and passwords
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 24
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

// JWT algorithm used for signing and verifying tokens
export const JWT_ALGORITHM = 'HS256' as const
