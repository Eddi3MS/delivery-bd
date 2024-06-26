import mongoose from 'mongoose'

const dbConnection = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI!)

    console.log(`MongoDB Connected: ${connection.host}`)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error?.message}`)
    }
    process.exit(1)
  }
}

export default dbConnection

