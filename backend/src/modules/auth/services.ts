import mongoose from 'mongoose'

import { SESSION_HARD_TTL_MS, SESSION_TTL_MS } from '../../config/constants.js'
import { HttpError } from '../../errors/http-errors.js'
import Session from '../../db/models/session.js'
import User from '../../db/models/user.js'
import { createAuthToken, verifyAuthToken } from './jwt.js'
import { hashPassword, verifyPassword } from './password.js'
import type { AuthResult, LoginInput, PublicUser, SessionResult, SignupInput } from './types.js'

interface SessionToken {
  token: string
  cookieMaxAge: number
}

const DUPLICATE_KEY = 11000

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as { code: unknown }).code === DUPLICATE_KEY
  )
}

function isValidObjectId(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value)
}

function startOfToday(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

/**
 * lastOnlineAt only records the first request of a day, so it doubles as the
 * signal for whether expiresAt still needs extending.
 */
function isNewDay(lastOnlineAt: Date, now: Date): boolean {
  return startOfToday(lastOnlineAt) !== startOfToday(now)
}

function getLifetimeMs(expiresAt: Date, hardExpiresAt: Date): number {
  return Math.max(0, Math.min(expiresAt.getTime(), hardExpiresAt.getTime()) - Date.now())
}

function toPublicUser(user: { _id: unknown; username: string; email: string }): PublicUser {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
  }
}

async function issueSession(userId: string): Promise<SessionToken> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)
  const hardExpiresAt = new Date(now.getTime() + SESSION_HARD_TTL_MS)

  const session = await Session.create({
    userId,
    lastOnlineAt: now,
    expiresAt,
    hardExpiresAt,
  })

  const lifetimeMs = getLifetimeMs(expiresAt, hardExpiresAt)

  return {
    token: createAuthToken({ sessionId: session._id.toString() }, lifetimeMs),
    cookieMaxAge: lifetimeMs,
  }
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const existing = await User.exists({
    $or: [{ email: input.email }, { username: input.username }],
  })

  if (existing) {
    throw HttpError.conflict('Username or email already in use')
  }

  const password = await hashPassword(input.password)
  let user

  try {
    user = await User.create({
      username: input.username,
      email: input.email,
      password,
    })
  } catch (error) {
    // A concurrent signup can win the unique index race after the check above.
    if (isDuplicateKeyError(error)) {
      throw HttpError.conflict('Username or email already in use')
    }

    throw error
  }

  return { user: toPublicUser(user), ...(await issueSession(user._id.toString())) }
}

/**
 * A missing account is compared against a real hash so a wrong identifier and a
 * wrong password take the same amount of time to reject.
 */
let decoyHash: Promise<string> | null = null

function getDecoyHash(): Promise<string> {
  decoyHash ??= hashPassword('decoy-password-for-timing')

  return decoyHash
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({
    $or: [{ email: input.identifier }, { username: input.identifier }],
  }).select('+password')

  const hash = user?.password ?? (await getDecoyHash())
  const matches = await verifyPassword(hash, input.password)

  if (!user || !matches) {
    throw HttpError.unauthorized('Invalid credentials')
  }

  return { user: toPublicUser(user), ...(await issueSession(user._id.toString())) }
}

export async function getSession(token: string): Promise<SessionResult> {
  const { sessionId } = verifyAuthToken(token)

  if (!isValidObjectId(sessionId)) {
    throw HttpError.unauthorized('Invalid session')
  }

  const session = await Session.findById(sessionId)
  const now = new Date()

  if (!session) {
    throw HttpError.unauthorized('Session not found')
  }

  const expired =
    session.hardExpiresAt.getTime() <= now.getTime() ||
    session.expiresAt.getTime() <= now.getTime()

  if (expired) {
    await Session.deleteOne({ _id: session._id })
    throw HttpError.unauthorized('Session expired')
  }

  const user = await User.findById(session.userId)

  if (!user) {
    throw HttpError.unauthorized('Account no longer exists')
  }

  const refreshed = isNewDay(session.lastOnlineAt, now)

  if (refreshed) {
    session.lastOnlineAt = now
    session.expiresAt = new Date(
      Math.min(now.getTime() + SESSION_TTL_MS, session.hardExpiresAt.getTime())
    )
    await session.save()
  }

  const lifetimeMs = getLifetimeMs(session.expiresAt, session.hardExpiresAt)

  return {
    user: toPublicUser(user),
    sessionId: session._id.toString(),
    token: createAuthToken({ sessionId: session._id.toString() }, lifetimeMs),
    cookieMaxAge: lifetimeMs,
    refreshed,
  }
}

export async function logout(token: string | undefined): Promise<void> {
  if (!token) return

  let sessionId: string

  try {
    sessionId = verifyAuthToken(token).sessionId
  } catch {
    return
  }

  if (isValidObjectId(sessionId)) {
    await Session.deleteOne({ _id: sessionId })
  }
}
