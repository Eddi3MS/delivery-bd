import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      minLength: 6,
      required: true,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
  },
  {
    timestamps: true,
  }
)

export const UserModel = model('User', userSchema)
