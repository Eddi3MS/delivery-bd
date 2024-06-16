import bcrypt from 'bcryptjs'

export async function generateHashedPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  return hashedPassword
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword)
}
