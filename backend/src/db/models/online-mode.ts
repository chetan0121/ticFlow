import mongoose from 'mongoose'
import { ONLINE_MODE_TTL_SECONDS } from '../../config/constants.js'

const onlineModeSchema = new mongoose.Schema(
  {
    gameId: { type: String, required: true, unique: true, index: true },
    kind: { type: String, enum: ['friend', 'matchmaking'], default: 'friend', required: true },
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

onlineModeSchema.index({ updatedAt: 1 }, { expireAfterSeconds: ONLINE_MODE_TTL_SECONDS })

// Retain the established collection while changing the application model name.
export const OnlineMode = mongoose.model('OnlineMode', onlineModeSchema, 'friendgames')
export default OnlineMode
