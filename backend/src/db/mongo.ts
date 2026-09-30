import mongoose from 'mongoose'
import env from '../config/env.js'

let db: mongoose.Mongoose | null = null

export async function connectMongo() {
  if (db) return db

  db = await mongoose.connect(env.mongoUri)
  if (!db) throw new Error('Failed to connect to MongoDB')

  return db
}

export const getDb = connectMongo

export async function closeMongo() {
  if (db) {
    await mongoose.disconnect()
    db = null
  }
}
