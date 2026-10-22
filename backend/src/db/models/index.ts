import Session from './session.js'
import User from './user.js'
import FriendGame from './friend-game.js'

export async function ensureIndexes(): Promise<void> {
  await Promise.all([User.createIndexes(), Session.createIndexes(), FriendGame.createIndexes()])
}
