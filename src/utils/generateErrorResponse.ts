import { Response } from 'express'

const generateErrorResponse = ({
  error,
  res,
  code = 500,
}: {
  error: unknown
  res: Response
  code?: number
}) => {
  let errorMessage = 'Something went wrong.'

  if (error instanceof Error) {
    errorMessage = error.message
  }

  res.status(code).json({ error: errorMessage })
}

export default generateErrorResponse
