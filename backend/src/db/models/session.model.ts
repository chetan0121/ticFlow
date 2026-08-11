import type { Collection, ObjectId } from 'mongodb'

import { getDb } from '../mongo.js'

export interface SessionDocument {
  _id: ObjectId
  userId: ObjectId
  createdAt: Date
  expiresAt: Date
  absoluteExpiresAt: Date
}

export async function getSessionCollection(): Promise<Collection<SessionDocument>> {
  const db = await getDb()
  const collection = db.collection<SessionDocument>('sessions')

  await collection.createIndexes([
    { key: { userId: 1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
  ])

  return collection
}
