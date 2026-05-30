import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import authRoutes from './routes/auth.js'
import aiRoutes from './routes/ai.js'

const app = express()
const PORT = process.env.PORT || 3001
const __dirname = dirname(fileURLToPath(import.meta.url))
const clientDist = join(__dirname, '../../client/dist')

// Security
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json({ limit: '2mb' }))

// CORS — only needed in dev (prod: same origin)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }))
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
})
app.use(limiter)

// AI proxy has stricter limit
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,
  message: { error: 'Too many AI requests, slow down.' },
})

// Routes
app.use('/auth', authRoutes)
app.use('/ai', aiLimiter, aiRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' })
})

// Serve React client in production
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'))
  })
} else {
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
  })
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Vibemap server running on port ${PORT}`)
})
