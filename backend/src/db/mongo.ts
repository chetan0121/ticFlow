import { setServers } from 'node:dns'
import { MongoClient, type Db } from 'mongodb'

import { env } from '../config/env.js'

setServers(env.dnsServers)

const client = new MongoClient(env.mongoUri)
let isConnected = false
let db: Db | null = null

export async function connectMongo() {
  await client.connect()
  isConnected = true
  db = client.db(env.mongoDbName)
  return db
}

export async function getDb() {
  if (!db) {
    return connectMongo()
  }

  return db
}

export async function closeMongo() {
  await client.close()
  isConnected = false
  db = null
}

export async function pingMongo() {
  if (!isConnected) {
    await connectMongo()
  }

  await client.db(env.mongoDbName).command({ ping: 1 })
}
