import { FormModel } from '~/server/models/Form'
import { SubmissionModel } from '~/server/models/Submission'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.formId || !body.formSlug || !body.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'formId, formSlug, and data are required',
    })
  }

  const form = await FormModel.findById(body.formId).lean()
  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  const submission = await SubmissionModel.create({
    formId: body.formId,
    formSlug: body.formSlug,
    data: body.data,
  })

  return { success: true, id: submission._id }
})
