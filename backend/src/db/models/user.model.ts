import type { Collection, ObjectId } from 'mongodb'

import { getDb } from '../mongo.js'

export interface UserDocument {
  _id: ObjectId
  username: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface PublicUser {
  id: string
  username: string
  email: string
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  }
}

export async function getUserCollection(): Promise<Collection<UserDocument>> {
  const db = await getDb()
  const collection = db.collection<UserDocument>('users')

  await collection.createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { username: 1 }, unique: true },
  ])

  return collection
}
