import type { H3Event } from 'h3'

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  const cutoff = now - windowMs
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}

export function checkRateLimit(
  event: H3Event,
  { maxRequests = 5, windowMs = 60_000 } = {},
): void {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()

  cleanup(windowMs)

  let entry = store.get(ip)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(ip, entry)
  }

  entry.timestamps = entry.timestamps.filter(t => t > now - windowMs)
  entry.timestamps.push(now)

  if (entry.timestamps.length > maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.',
    })
  }
}
