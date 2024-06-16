import { v2 as cloudinary } from 'cloudinary'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import dbConnection from './db'
import userRoutes from './routes/userRoutes'
import { app, server } from './socket/socket'

const pathname = path.resolve()

dotenv.config({
  path: path.resolve(pathname, '.env.local'),
  override: true,
})

dbConnection()

const PORT = process.env.PORT || 5000

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Middlewares
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.use('/api/users', userRoutes)

server.listen(PORT, () => console.log(`Server started at port ${PORT}`))
