import mongoose from 'mongoose'

import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../../config/constants.js'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength: USERNAME_MIN_LENGTH,
      maxLength: USERNAME_MAX_LENGTH,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength: 5,
      maxLength: 255,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)
export default User
