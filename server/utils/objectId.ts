import mongoose from 'mongoose'
import type { H3Event } from 'h3'

/**
 * Validates a string as a MongoDB ObjectId.
 * Throws createError(400) if invalid.
 * Returns the value unchanged for use in queries.
 */
export function requireValidObjectId(event: H3Event, value: string | undefined, paramName = 'id'): string {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw createError({ statusCode: 400, statusMessage: `${paramName} is required` })
  }
  const str = String(value).trim()
  if (!mongoose.Types.ObjectId.isValid(str)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${paramName}` })
  }
  return str
}
