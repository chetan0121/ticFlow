import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastOnlineAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    hardExpiresAt: {
      type: Date,
      required: true,
    },
  }
)

const Session = mongoose.model('Session', sessionSchema)
export default Session