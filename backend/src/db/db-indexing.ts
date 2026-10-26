import Session from './models/session.js'
import User from './models/user.js'
import OnlineMode from './models/online-mode.js'

export async function ensureIndexes(): Promise<void> {
  await Promise.all([User.createIndexes(), Session.createIndexes(), OnlineMode.createIndexes()])
}
