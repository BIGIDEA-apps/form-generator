import { FormModel } from '~/server/models/Form'

async function generateUniqueBigIdeaSlug(): Promise<string> {
  const base = 'big-idea-form'
  let exists = true
  let attempts = 0
  const maxAttempts = 100

  while (exists && attempts < maxAttempts) {
    const suffix = Math.floor(Math.random() * 1e9).toString()
    const slug = `${base}-${suffix}`
    const existing = await FormModel.findOne({ slug }).lean()
    if (!existing) return slug
    attempts++
  }

  return `${base}-${Date.now()}`
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  delete body._id
  delete body.createdAt

  if (!body.slug || String(body.slug).trim() === '') {
    body.slug = await generateUniqueBigIdeaSlug()
  }

  const form = await FormModel.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true },
  ).lean()

  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  return form
})
