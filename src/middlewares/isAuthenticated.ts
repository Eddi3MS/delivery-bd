import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { merge } from 'lodash'
import { getUserById } from '../db/users'
import generateErrorResponse from '../utils/generateErrorResponse'

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt

    if (!token)
      return generateErrorResponse({
        error: new Error('Unauthorized'),
        res,
        code: 401,
      })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as {
      userId: string
    }

    const user = await getUserById(decoded.userId)

    if (!user) {
      res.cookie('jwt', '', { maxAge: 1 })

      return generateErrorResponse({
        error: new Error('User not found.'),
        res,
        code: 401,
      })
    }

    console.log('🚀 ~ user:', user.role, user.name)
    merge(req, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
        role: user.role,
      },
    })

    next()
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

export default isAuthenticated

