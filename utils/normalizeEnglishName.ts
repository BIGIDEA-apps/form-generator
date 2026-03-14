/**
 * Normalizes an English name: each word starts with a capital letter,
 * the rest of the letters are lowercase.
 * Example: "john doe" → "John Doe", "MARY JANE" → "Mary Jane"
 */
export function normalizeEnglishName(value: string): string {
  if (!value || typeof value !== 'string') return ''
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
