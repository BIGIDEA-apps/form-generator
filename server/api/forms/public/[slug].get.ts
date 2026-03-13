import { FormModel } from '~/server/models/Form'

const PUBLIC_FIELDS = [
  'slug', 'formTitle',
  'primaryLogo', 'primaryLogoSvgToWhite',
  'secondaryLogo', 'secondaryLogoSvgToWhite',
  'mainDescription', 'pages', 'fields', 'isActive',
].join(' ')

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const form = await FormModel
    .findOne({ slug, isActive: true })
    .select(PUBLIC_FIELDS)
    .lean()

  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  return form
})
