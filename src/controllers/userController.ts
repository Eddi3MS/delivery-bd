import { v2 as cloudinary } from 'cloudinary'
import { Request, Response } from 'express'
import { get } from 'lodash'
import mongoose from 'mongoose'
import { createUser, getUserByEmail, getUserById } from '../db/users'
import {
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
} from '../schemas/userSchema'
import generateErrorResponse from '../utils/generateErrorResponse'
import generateTokenAndSetCookie from '../utils/generateTokenAndSetCookie'
import {
  comparePasswords,
  generateHashedPassword,
} from '../utils/passwordHandler'

const signupUser = async (req: Request, res: Response) => {
  try {
    const parsedBody = registerUserSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Wrong data format'),
        res,
        code: 400,
      })
    }

    const { name, email, password, phone } = parsedBody.data

    const user = await getUserByEmail(email)

    if (user)
      return generateErrorResponse({
        error: new Error('Email already in use'),
        res,
        code: 400,
      })

    const hashedPassword = await generateHashedPassword(password)

    const newUser = await createUser({
      name,
      email,
      phone,
      password: hashedPassword,
    })

    generateTokenAndSetCookie(newUser._id, res)

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      profilePic: newUser.profilePic,
      role: newUser.role,
    })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

const loginUser = async (req: Request, res: Response) => {
  try {
    const parsedBody = loginUserSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid Params'),
        res,
        code: 400,
      })
    }

    const { email, password } = parsedBody.data

    const user = await getUserByEmail(email)

    if (!user)
      return generateErrorResponse({
        error: new Error('Invalid Params'),
        res,
        code: 400,
      })

    const isPasswordCorrect = await comparePasswords(password, user.password)

    if (!isPasswordCorrect)
      return generateErrorResponse({
        error: new Error('Invalid Params'),
        res,
        code: 400,
      })

    generateTokenAndSetCookie(user._id, res)

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      role: user.role,
    })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

const logoutUser = (_: Request, res: Response) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 })
    res.status(200).json({ message: 'User logged out successfully' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

const updateUser = async (req: Request, res: Response) => {
  const parsedBody = updateUserSchema.safeParse(req.body)

  if (!parsedBody.success)
    return generateErrorResponse({
      error: new Error('Wrong data format'),
      res,
      code: 400,
    })

  const { name, email, password, phone } = parsedBody.data
  let { profilePic } = parsedBody.data

  const userId = get(req, 'user._id') as unknown as string

  if (!userId)
    return generateErrorResponse({
      error: new Error('User not found'),
      res,
      code: 400,
    })

  if (req.params.id !== userId.toString())
    return generateErrorResponse({
      error: new Error("You cannot update other user's profile"),
      res,
      code: 400,
    })

  try {
    let user = await getUserById(userId)

    if (!user)
      return generateErrorResponse({
        error: new Error('User not found'),
        res,
        code: 400,
      })

    if (password) {
      const hashedPassword = await generateHashedPassword(password)
      user.password = hashedPassword
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic?.split('/')?.pop()?.split('.')[0] || ''
        )
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic)
      profilePic = uploadedResponse.secure_url
    }

    user.name = name || user.name
    user.email = email || user.email
    user.profilePic = profilePic || user.profilePic
    user.phone = phone || user.phone

    user = await user.save()

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      role: user.role,
    })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

const getUserProfile = async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return generateErrorResponse({
      error: new Error('Invalid query param'),
      res,
      code: 400,
    })

  const isAdmin =
    (get(req, 'user.role') as unknown as 'USER' | 'ADMIN') === 'ADMIN'

  const currUserId = get(req, 'user._id') as unknown as string

  if (id !== currUserId && !isAdmin)
    return generateErrorResponse({
      error: new Error('Not allowed.'),
      res,
      code: 400,
    })

  try {
    const user = await getUserById(id)

    if (!user)
      return generateErrorResponse({
        error: new Error('User not found'),
        res,
        code: 404,
      })

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      role: user.role,
    })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

const getOwnUserProfile = async (req: Request, res: Response) => {
  const user = get(req, 'user') as any

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profilePic: user.profilePic,
    role: user.role,
  })
}

export {
  getOwnUserProfile,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
}
