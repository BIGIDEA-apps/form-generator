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
    FormModel.aggregate([
      { $match: filter },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'formId',
          as: '_subs',
        },
      },
      {
        $addFields: {
          submissionsCount: { $size: '$_subs' },
        },
      },
      {
        $project: {
          _subs: 0,
          __v: 0,
        },
      },
    ]),
    FormModel.countDocuments(filter),
  ])

  return { items, total, page, limit }
})
