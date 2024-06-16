import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import cors from 'cors'

const app = express()

app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
  })
)

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

const userSocketMap: Record<string, string> = {}

io.on('connection', (socket) => {
  console.log('user connected', socket.id)
  const userId = socket.handshake.query.userId

  if (typeof userId === 'string') userSocketMap[userId] = socket.id

  socket.on('disconnect', () => {
    console.log('user disconnected')
    if (typeof userId === 'string') delete userSocketMap[userId]
  })
})

export { io, server, app }

