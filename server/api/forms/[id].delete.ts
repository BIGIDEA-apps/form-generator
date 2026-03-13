import { FormModel } from '~/server/models/Form'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  const form = await FormModel.findByIdAndDelete(id)
  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  return { success: true }
})
