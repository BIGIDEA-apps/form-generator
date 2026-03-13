import { FormModel } from '~/server/models/Form'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  const original = await FormModel.findById(id).lean()
  if (!original) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  const suffix = Date.now().toString(36)
  const { _id, createdAt, updatedAt, ...data } = original as any

  const duplicate = await FormModel.create({
    ...data,
    formName: `${data.formName} (העתק)`,
    slug: `${data.slug}-copy-${suffix}`,
    isActive: false,
  })

  return duplicate.toObject()
})
