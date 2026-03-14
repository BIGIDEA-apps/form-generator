import { FormModel } from '~/server/models/Form'
import { requireValidObjectId } from '~/server/utils/objectId'
import { sanitizeHtml } from '~/server/utils/sanitizeHtml'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = requireValidObjectId(event, getRouterParam(event, 'id'))

  const form = await FormModel.findById(id).lean()
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
