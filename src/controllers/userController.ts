import { v2 as cloudinary } from 'cloudinary'
import { Request, Response } from 'express'
import { get } from 'lodash'
import mongoose from 'mongoose'
import { UserModel } from '../db/users'
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

async function signupHandler(req: Request, res: Response) {
  try {
    const parsedBody = registerUserSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid params'),
        res,
        code: 400,
      })
    }

    const { name, email, password, phone } = parsedBody.data

    const user = await UserModel.findOne({ email })

    if (user)
      return generateErrorResponse({
        error: new Error('Email already in use'),
        res,
        code: 400,
      })

    const hashedPassword = await generateHashedPassword(password)

    const newUser = await UserModel.create({
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

async function signinHandler(req: Request, res: Response) {
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

    const user = await UserModel.findOne({ email })

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

async function logoutHandler(_: Request, res: Response) {
  try {
    res.cookie('jwt', '', { maxAge: 1 })
    res.status(200).json({ message: 'User logged out successfully' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function updateAccountHandler(req: Request, res: Response) {
  try {
    const parsedBody = updateUserSchema.safeParse(req.body)

    if (!parsedBody.success)
      return generateErrorResponse({
        error: new Error('Wrong data format'),
        res,
        code: 400,
      })

    const { name, email, phone } = parsedBody.data
    let { profilePic, password } = parsedBody.data

    const id = get(req, 'user._id') as unknown as string
    const currPicture = get(req, 'user.profilePic') as unknown as string

    if (req.params.id !== id.toString())
      return generateErrorResponse({
        error: new Error('Unauthorized'),
        res,
        code: 401,
      })

    if (password) {
      const hashedPassword = await generateHashedPassword(password)
      password = hashedPassword
    }

    if (profilePic) {
      if (currPicture) {
        await cloudinary.uploader.destroy(currPicture)
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic)
      profilePic = uploadedResponse.public_id
    }

    const dataToUpdate = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(profilePic && { profilePic }),
      ...(password && { password }),
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
    })

    if (!updatedUser) {
      return generateErrorResponse({
        error: new Error('Unauthorized'),
        res,
        code: 401,
      })
    }

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profilePic: updatedUser.profilePic,
      role: updatedUser.role,
    })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function getUserProfileHandler(req: Request, res: Response) {
  try {
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

    if (id !== currUserId && !isAdmin) {
      return generateErrorResponse({
        error: new Error('Not allowed.'),
        res,
        code: 400,
      })
    }

    const user = await UserModel.findById(id)

    if (!user) {
      return generateErrorResponse({
        error: new Error('User not found'),
        res,
        code: 404,
      })
    }

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

export {
  getUserProfileHandler,
  logoutHandler,
  signinHandler,
  signupHandler,
  updateAccountHandler,
}
