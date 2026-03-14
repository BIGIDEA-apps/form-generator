/**
 * Normalizes a web address by adding https:// if no protocol is present.
 * Accepts inputs like "google.co.il", "www.example.com", "https://example.com".
 *
 * @param input - Raw web address (with or without protocol)
 * @returns Normalized URL with protocol, or null if invalid
 */
export function normalizeWebAddress(input: string): string | null {
  const trimmed = String(input ?? '').trim()
  if (!trimmed) return null

  let toValidate = trimmed
  if (!/^https?:\/\//i.test(trimmed)) {
    toValidate = `https://${trimmed}`
  }

  try {
    const url = new URL(toValidate)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.href
  } catch {
    return null
  }
}
