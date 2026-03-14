import { FormModel } from '~/server/models/Form'
import { SubmissionModel } from '~/server/models/Submission'
import { requireValidObjectId } from '~/server/utils/objectId'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const formId = requireValidObjectId(event, String(query.formId || ''), 'formId')

  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 30))
  const skip = (page - 1) * limit
  const search = String(query.search || '').trim()

  const filter: Record<string, any> = { formId }

  if (search) {
    const form = await FormModel.findById(formId).select('fields').lean() as any
    const regex = { $regex: search, $options: 'i' }
    const conditions: Record<string, any>[] = [
      { formName: regex },
      { company: regex },
    ]

    if (form?.fields) {
      for (const key of Object.keys(form.fields)) {
        conditions.push({ [`data.${key}`]: regex })
      }
    }

    filter.$or = conditions
  }

  const [items, total] = await Promise.all([
    SubmissionModel
      .find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SubmissionModel.countDocuments(filter),
  ])

  return { items, total, page, limit }
})
