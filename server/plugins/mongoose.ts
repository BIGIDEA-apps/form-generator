import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    console.warn('[Mongoose] MONGODB_URI is not set – skipping DB connection')
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('[Mongoose] Connected to MongoDB')
  }
  catch (err) {
    console.error('[Mongoose] Connection error:', err)
  }
})
