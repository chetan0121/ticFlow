import { MongoServerError, ObjectId } from 'mongodb'

import {
  MAX_ACTIVE_SESSIONS,
  SESSION_HARD_TTL_MS,
  SESSION_SOFT_TTL_MS,
} from '../../config/constants.js'
import { getSessionCollection, type SessionDocument } from '../../db/models/session.model.js'
import {
  getUserCollection,
  toPublicUser,
  type PublicUser,
  type UserDocument,
} from '../../db/models/user.model.js'
import { HttpError } from '../../errors/http-error.js'
import { createAuthToken, verifyAuthToken } from './jwt.js'
import { hashPassword, verifyPassword } from './password.js'
import type { AuthSessionResult, LoginRequest, SignupRequest } from './auth.types.js'

function getCookieMaxAgeMs(expiresAt: Date) {
  return Math.max(0, expiresAt.getTime() - Date.now())
}

function getJwtExpirySeconds(expiresAt: Date) {
  return Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
}

function createSessionDates(now = new Date()) {
  return {
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_SOFT_TTL_MS),
    hardExpiresAt: new Date(now.getTime() + SESSION_HARD_TTL_MS),
    lastRefreshedAt: now,
  }
}

function assertObjectId(value: string) {
  if (!ObjectId.isValid(value)) {
    throw new HttpError(401, 'Invalid session')
  }

  return new ObjectId(value)
}

function getUtcDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function shouldRefreshSession(session: SessionDocument, now: Date) {
  return getUtcDateKey(session.lastRefreshedAt) !== getUtcDateKey(now)
}

function isDuplicateKeyError(error: unknown) {
  return error instanceof MongoServerError && error.code === 11000
}

function buildAuthResult(
  user: PublicUser,
  session: SessionDocument,
  refreshed: boolean
): AuthSessionResult {
  return {
    cookieMaxAgeMs: getCookieMaxAgeMs(session.expiresAt),
    refreshed,
    token: createAuthToken(
      { sessionId: session._id.toString(), userId: session.userId.toString() },
      getJwtExpirySeconds(session.expiresAt)
    ),
    user,
  }
}

async function trimOldSessions(userId: ObjectId) {
  const sessions = await getSessionCollection()
  const now = new Date()

  const activeSessions = await sessions
    .find({ userId, revokedAt: null, expiresAt: { $gt: now } })
    .sort({ lastRefreshedAt: -1, createdAt: -1 })
    .project<{ _id: ObjectId }>({ _id: 1 })
    .toArray()

  const staleSessionIds = activeSessions.slice(MAX_ACTIVE_SESSIONS).map(session => session._id)

  if (staleSessionIds.length > 0) {
    await sessions.updateMany(
      { _id: { $in: staleSessionIds } },
      { $set: { revokedAt: now, expiresAt: now } }
    )
  }
}

async function createSession(user: UserDocument): Promise<AuthSessionResult> {
  const sessions = await getSessionCollection()
  const dates = createSessionDates()
  const session: SessionDocument = {
    _id: new ObjectId(),
    userId: user._id,
    revokedAt: null,
    ...dates,
  }

  await sessions.insertOne(session)
  await trimOldSessions(user._id)

  return buildAuthResult(toPublicUser(user), session, true)
}

export async function signup(input: SignupRequest): Promise<AuthSessionResult> {
  const users = await getUserCollection()
  const existingUser = await users.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  })

  if (existingUser) {
    throw new HttpError(409, 'Email or username already exists')
  }

  const now = new Date()
  const user: UserDocument = {
    _id: new ObjectId(),
    username: input.username,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  }

  try {
    await users.insertOne(user)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, 'Email or username already exists')
    }

    throw error
  }

  return createSession(user)
}

export async function login(input: LoginRequest): Promise<AuthSessionResult> {
  const users = await getUserCollection()
  const user = await users.findOne({
    $or: [{ email: input.identifier }, { username: input.identifier }],
  })

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password')
  }

  return createSession(user)
}

export async function getCurrentUser(token: string): Promise<AuthSessionResult> {
  const payload = verifyAuthToken(token)
  const sessionId = assertObjectId(payload.sessionId)
  const userId = assertObjectId(payload.userId)
  const sessions = await getSessionCollection()
  const users = await getUserCollection()
  const now = new Date()
  const session = await sessions.findOne({ _id: sessionId, userId, revokedAt: null })

  if (!session || session.expiresAt <= now || session.hardExpiresAt <= now) {
    throw new HttpError(401, 'Session expired')
  }

  const user = await users.findOne({ _id: userId })

  if (!user) {
    throw new HttpError(401, 'User not found')
  }

  if (!shouldRefreshSession(session, now)) {
    return buildAuthResult(toPublicUser(user), session, false)
  }

  const refreshedExpiresAt = new Date(
    Math.min(now.getTime() + SESSION_SOFT_TTL_MS, session.hardExpiresAt.getTime())
  )

  const updatedSession: SessionDocument = {
    ...session,
    expiresAt: refreshedExpiresAt,
    lastRefreshedAt: now,
  }

  await sessions.updateOne(
    { _id: session._id, revokedAt: null },
    { $set: { expiresAt: refreshedExpiresAt, lastRefreshedAt: now } }
  )

  return buildAuthResult(toPublicUser(user), updatedSession, true)
}

export async function logout(token: string | undefined) {
  if (!token) return

  const payload = verifyAuthToken(token)
  const sessions = await getSessionCollection()

  await sessions.updateOne(
    { _id: assertObjectId(payload.sessionId) },
    { $set: { revokedAt: new Date(), expiresAt: new Date() } }
  )
}
