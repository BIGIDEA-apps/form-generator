import { FormModel } from '~/server/models/Form'

function generateSlug(name: string): string {
  const base = name
    .replace(/[^\w\u0590-\u05FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 40)

  const suffix = Date.now().toString(36)
  return `${base}-${suffix}`
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)

  if (!body.formName) {
    throw createError({ statusCode: 400, statusMessage: 'formName is required' })
  }

  const slug = body.slug || generateSlug(body.formName)

  const existingSlug = await FormModel.findOne({ slug }).lean()
  if (existingSlug) {
    throw createError({ statusCode: 409, statusMessage: 'Slug already exists' })
  }

  const form = await FormModel.create({
    ...body,
    slug,
  })

  return form.toObject()
})
