import mongoose from 'mongoose'
import { consola } from 'consola'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    consola.warn('[Mongoose] MONGODB_URI is not set – skipping DB connection')
    return
  }

  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      })
      consola.info('[Mongoose] Connected to MongoDB')
      mongoose.connection.on('error', (err) => {
        consola.error('[Mongoose] Connection error:', err)
      })
      mongoose.connection.on('disconnected', () => {
        consola.warn('[Mongoose] Disconnected from MongoDB')
      })
      return
    }
    catch (err) {
      lastErr = err
      consola.error(`[Mongoose] Connection attempt ${attempt}/${MAX_RETRIES} failed:`, err)
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      }
    }
  }

  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction) {
    consola.error('[Mongoose] Failed to connect after retries. Exiting.')
    process.exit(1)
  }
  else {
    consola.error('[Mongoose] Failed to connect. App may run with limited functionality.', lastErr)
  }
})
