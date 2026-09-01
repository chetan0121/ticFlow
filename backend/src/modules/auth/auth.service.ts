import { ObjectId } from 'mongodb'

import {
  AUTH_COOKIE_NAME,
  SESSION_ABSOLUTE_TTL_MS,
  SESSION_TTL_MS,
} from '../../config/constants.js'
import { getSessionCollection } from '../../db/models/session.model.js'
import {
  getUserCollection,
  toPublicUser,
  type PublicUser,
  type UserDocument,
} from '../../db/models/user.model.js'
import { HttpError } from '../../http/errors.js'
import { createAuthToken, verifyAuthToken } from './jwt.js'
import { hashPassword, verifyPassword } from './password.js'
import type { LoginRequest, SignupRequest } from './auth.types.js'

const MAX_ACTIVE_SESSIONS = 3

export interface AuthSessionResult {
  cookieName: string
  maxAgeSeconds: number
  token: string
  user: PublicUser
}

function nowDates() {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)
  const absoluteExpiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_TTL_MS)

  return { now, expiresAt, absoluteExpiresAt }
}

function createToken(sessionId: ObjectId, userId: ObjectId, expiresAt: Date) {
  const nowSeconds = Math.floor(Date.now() / 1000)

  return createAuthToken({
    sessionId: sessionId.toString(),
    userId: userId.toString(),
    iat: nowSeconds,
    exp: Math.floor(expiresAt.getTime() / 1000),
  })
}

function getMaxAgeSeconds(expiresAt: Date) {
  return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
}

function assertValidObjectId(value: string) {
  if (!ObjectId.isValid(value)) {
    throw new HttpError(401, 'Invalid session')
  }

  return new ObjectId(value)
}

async function createSession(user: UserDocument): Promise<AuthSessionResult> {
  const sessions = await getSessionCollection()
  const { now, expiresAt, absoluteExpiresAt } = nowDates()
  const session = await sessions.insertOne({
    _id: new ObjectId(),
    userId: user._id,
    createdAt: now,
    expiresAt,
    absoluteExpiresAt,
  })

  const activeSessions = await sessions
    .find({ userId: user._id })
    .sort({ createdAt: -1 })
    .project<{ _id: ObjectId }>({ _id: 1 })
    .toArray()

  const oldSessionIds = activeSessions
    .slice(MAX_ACTIVE_SESSIONS)
    .map(activeSession => activeSession._id)

  if (oldSessionIds.length > 0) {
    await sessions.deleteMany({ _id: { $in: oldSessionIds } })
  }

  const token = createToken(session.insertedId, user._id, expiresAt)

  return {
    cookieName: AUTH_COOKIE_NAME,
    maxAgeSeconds: getMaxAgeSeconds(expiresAt),
    token,
    user: toPublicUser(user),
  }
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
  const passwordHash = await hashPassword(input.password)
  const user: UserDocument = {
    _id: new ObjectId(),
    username: input.username,
    email: input.email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  }

  await users.insertOne(user)

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
  const sessionId = assertValidObjectId(payload.sessionId)
  const userId = assertValidObjectId(payload.userId)
  const sessions = await getSessionCollection()
  const users = await getUserCollection()
  const session = await sessions.findOne({ _id: sessionId, userId })
  const now = new Date()

  if (!session || session.expiresAt <= now || session.absoluteExpiresAt <= now) {
    throw new HttpError(401, 'Session expired')
  }

  const refreshedExpiresAt = new Date(
    Math.min(now.getTime() + SESSION_TTL_MS, session.absoluteExpiresAt.getTime())
  )
  await sessions.updateOne({ _id: session._id }, { $set: { expiresAt: refreshedExpiresAt } })

  const user = await users.findOne({ _id: userId })

  if (!user) {
    throw new HttpError(401, 'User not found')
  }

  return {
    cookieName: AUTH_COOKIE_NAME,
    maxAgeSeconds: getMaxAgeSeconds(refreshedExpiresAt),
    token: createToken(session._id, user._id, refreshedExpiresAt),
    user: toPublicUser(user),
  }
}

export async function logout(token: string | null) {
  if (!token) return

  const payload = verifyAuthToken(token)
  const sessions = await getSessionCollection()

  await sessions.deleteOne({ _id: assertValidObjectId(payload.sessionId) })
}
