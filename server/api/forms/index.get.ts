import { FormModel } from '~/server/models/Form'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const skip = (page - 1) * limit

  const search = String(query.search || query.q || '').trim()
  const filter = search
    ? {
        $or: [
          { formName: { $regex: search, $options: 'i' } },
          { formTitle: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ],
      }
    : {}

  const [items, total] = await Promise.all([
    FormModel
      .find(filter)
      .select('_id slug formName formTitle company isActive createdAt updatedAt spreadsheet campLandingPageUrl columnMappingMode columnMapping sourceTemplateId')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FormModel.countDocuments(filter),
  ])

  return { items, total, page, limit }
})
