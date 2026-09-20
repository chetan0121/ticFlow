import { setServers } from 'node:dns'

import { MongoClient, type Db } from 'mongodb'

import { env } from '../config/env.js'

if (env.dnsServers.length > 0) {
  setServers(env.dnsServers)
}

const client = new MongoClient(env.mongoUri)
let db: Db | null = null

export async function connectMongo() {
  if (db) return db

  await client.connect()
  db = client.db(env.mongoDbName)

  return db
}

export async function getDb() {
  return connectMongo()
}

export async function closeMongo() {
  await client.close()
  db = null
}

export async function pingMongo() {
  const database = await connectMongo()
  await database.command({ ping: 1 })
}
