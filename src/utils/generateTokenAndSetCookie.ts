import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

const generateTokenAndSetCookie = (userId: Types.ObjectId, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '15d',
  })

  res.cookie('jwt', token, {
    httpOnly: true, // more secure
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: 'none',
    secure: true,
  })

  return token
}

export default generateTokenAndSetCookie
