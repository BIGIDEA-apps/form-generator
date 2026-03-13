import mongoose from 'mongoose'
import { consola } from 'consola'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    consola.warn('[Mongoose] MONGODB_URI is not set – skipping DB connection')
    return
  }

  try {
    await mongoose.connect(uri)
    consola.info('[Mongoose] Connected to MongoDB')
  }
  catch (err) {
    consola.error('[Mongoose] Connection error:', err)
  }
})
