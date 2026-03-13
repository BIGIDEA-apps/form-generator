import sanitize from 'sanitize-html'

const ALLOWED_TAGS = ['p', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'br']

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  p: ['style'],
  li: ['style'],
}

const ALLOWED_STYLES: Record<string, Record<string, RegExp[]>> = {
  '*': {
    'text-align': [/^(left|right|center|justify)$/],
  },
}

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: ALLOWED_STYLES,
  })
}
