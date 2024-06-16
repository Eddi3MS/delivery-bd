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

export const getUsers = () => UserModel.find()

export const getUserByEmail = (email: string) => UserModel.findOne({ email })

export const getUserById = (id: string) => UserModel.findById(id)

export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject())

export const deleteUser = (id: string) =>
  UserModel.findOneAndDelete({ _id: id })

export const updateUser = (id: string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values).then((user) => user?.toObject())
