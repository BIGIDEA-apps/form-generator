import { FormModel } from '~/server/models/Form'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    FormModel
      .find({})
      .select('slug formName formTitle company isActive createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FormModel.countDocuments({}),
  ])

  return { items, total, page, limit }
})
