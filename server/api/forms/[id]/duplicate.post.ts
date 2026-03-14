import { FormModel } from '~/server/models/Form'
import { requireValidObjectId } from '~/server/utils/objectId'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = requireValidObjectId(event, getRouterParam(event, 'id'))

  const original = await FormModel.findById(id).lean()
  if (!original) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  const body = await readBody(event).catch(() => null)
  const spreadsheetOverride = body?.spreadsheet
  const sourceTemplateIdOverride = body?.sourceTemplateId

  const suffix = Date.now().toString(36)
  const { _id, createdAt, updatedAt, ...data } = original as any

  const duplicate = await FormModel.create({
    ...data,
    formName: `${data.formName} (העתק)`,
    slug: `${data.slug}-copy-${suffix}`,
    isActive: false,
    ...(spreadsheetOverride ? { spreadsheet: spreadsheetOverride } : {}),
    ...(sourceTemplateIdOverride ? { sourceTemplateId: sourceTemplateIdOverride } : {}),
  })

  return duplicate.toObject()
})
