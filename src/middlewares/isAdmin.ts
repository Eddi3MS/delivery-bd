import { NextFunction, Request, Response } from 'express'
import { get } from 'lodash'
import generateErrorResponse from '../utils/generateErrorResponse'

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin =
      (get(req, 'user.role') as unknown as 'USER' | 'ADMIN') === 'ADMIN'

    if (!isAdmin) {
      res.cookie('jwt', '', { maxAge: 1 })

      return generateErrorResponse({
        error: new Error('Unauthorized.'),
        res,
        code: 401,
      })
    }

    next()
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

export default isAdmin

