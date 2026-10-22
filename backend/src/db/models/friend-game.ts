import mongoose from 'mongoose'
import { FRIEND_GAME_TTL_SECONDS } from '../../config/constants.js'

const friendGameSchema = new mongoose.Schema(
  {
    gameId: { type: String, required: true, unique: true, index: true },
    inviteCode: { type: String, required: true, unique: true, index: true },
    config: { type: mongoose.Schema.Types.Mixed, required: true },
    game: { type: mongoose.Schema.Types.Mixed, required: true },
    playerIds: { type: mongoose.Schema.Types.Mixed, required: true },
    playerNames: { type: mongoose.Schema.Types.Mixed, required: true },
    drawRequestedBy: { type: [String], default: [] },
    rematchRequestedBy: { type: [String], default: [] },
    lastClockUpdateAt: { type: Number, required: true },
  },
  { timestamps: true }
)

friendGameSchema.index({ updatedAt: 1 }, { expireAfterSeconds: FRIEND_GAME_TTL_SECONDS })

export const FriendGame = mongoose.model('FriendGame', friendGameSchema)
export default FriendGame
