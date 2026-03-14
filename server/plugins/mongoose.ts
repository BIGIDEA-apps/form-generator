import mongoose from 'mongoose'
import { consola } from 'consola'
import { AppSettingsModel } from '~/server/models/AppSettings'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri
  const dbName = config.mongodbDatabase

  if (!uri) {
    consola.warn('[Mongoose] MONGODB_URI is not set – skipping DB connection')
    return
  }

  const connectOptions: Parameters<typeof mongoose.connect>[1] = {
    serverSelectionTimeoutMS: 10000,
  }
  if (dbName && String(dbName).trim()) {
    connectOptions.dbName = String(dbName).trim()
    consola.info('[Mongoose] Using database:', connectOptions.dbName)
  }

  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, connectOptions)
      consola.info('[Mongoose] Connected to MongoDB')
      mongoose.connection.on('error', (err) => {
        consola.error('[Mongoose] Connection error:', err)
      })
      mongoose.connection.on('disconnected', () => {
        consola.warn('[Mongoose] Disconnected from MongoDB')
      })
      await migrateLogoPath()
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

async function migrateLogoPath() {
  const OLD = '/img/logos/bigidea-logo.png'
  const NEW = '/img/logos/bigidea-logo.svg'
  const result = await AppSettingsModel.updateMany(
    { defaultPrimaryLogo: OLD },
    { $set: { defaultPrimaryLogo: NEW } },
  )
  if (result.modifiedCount > 0) {
    consola.info(`[Migrate] Updated ${result.modifiedCount} AppSettings document(s): logo PNG → SVG`)
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
