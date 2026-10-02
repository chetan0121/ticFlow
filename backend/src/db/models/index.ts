import Session from './session.js'
import User from './user.js'

export async function ensureIndexes(): Promise<void> {
  await Promise.all([User.createIndexes(), Session.createIndexes()])
}
