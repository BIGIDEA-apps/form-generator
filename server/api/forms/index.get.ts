import { FormModel } from '~/server/models/Form'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const forms = await FormModel
    .find({})
    .select('slug formName formTitle company isActive createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean()

  return forms
})
