import { FormModel } from '~/server/models/Form'
import { sanitizeHtml } from '~/server/utils/sanitizeHtml'

const PUBLIC_FIELDS = [
  'slug', 'formTitle',
  'primaryLogo', 'primaryLogoSvgToWhite',
  'secondaryLogo', 'secondaryLogoSvgToWhite',
  'mainDescription', 'pages', 'fields', 'isActive',
].join(' ')

const SLUG_REGEX = /^[a-zA-Z0-9_-]{1,100}$/

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !SLUG_REGEX.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })
  }

  const form = await FormModel
    .findOne({ slug, isActive: true })
    .select(PUBLIC_FIELDS)
    .lean()

  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  const formObj = form as any
  if (formObj.fields && typeof formObj.fields === 'object') {
    for (const field of Object.values(formObj.fields) as any[]) {
      if (field?.inputType === 'display' && typeof field.defaultValue === 'string') {
        field.defaultValue = sanitizeHtml(field.defaultValue)
      }
    }
  }
  if (typeof formObj.mainDescription === 'string') {
    formObj.mainDescription = sanitizeHtml(formObj.mainDescription)
  }

  return formObj
})
