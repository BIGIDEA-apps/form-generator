import { FormModel } from '~/server/models/Form'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const form = await FormModel.findOne({ slug, isActive: true }).lean()
  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  return form
})
