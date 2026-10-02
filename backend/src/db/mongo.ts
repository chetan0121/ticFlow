import mongoose from 'mongoose'
import env from '../config/env.js'

let connection: Promise<mongoose.Mongoose> | null = null

export function connectMongo(): Promise<mongoose.Mongoose> {
  if (!connection) {
    connection = mongoose.connect(env.mongoUri)
  }

  return connection
}

export function getConnectionState(): mongoose.ConnectionStates {
  return mongoose.connection.readyState
}

export async function closeMongo(): Promise<void> {
  if (!connection) return

  await mongoose.disconnect()
  connection = null
}
