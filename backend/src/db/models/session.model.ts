import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '../mongo.js'

export interface SessionDocument {
  _id: ObjectId
  userId: ObjectId
  createdAt: Date
  expiresAt: Date
  hardExpiresAt: Date
  lastRefreshedAt: Date
  revokedAt: Date | null
}

export async function getSessionCollection(): Promise<Collection<SessionDocument>> {
  const db = await getDb()
  return db.collection<SessionDocument>('sessions')
}

export async function ensureSessionIndexes() {
  const sessions = await getSessionCollection()

  await sessions.createIndexes([
    { key: { userId: 1, revokedAt: 1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
  ])
}
