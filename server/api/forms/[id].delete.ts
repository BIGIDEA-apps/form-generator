import { FormModel } from '~/server/models/Form'
import { requireValidObjectId } from '~/server/utils/objectId'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = requireValidObjectId(event, getRouterParam(event, 'id'))

  const form = await FormModel.findByIdAndDelete(id)
  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  return { success: true }
})
