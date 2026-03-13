import { FormModel } from '~/server/models/Form'
import { sanitizeHtml } from '~/server/utils/sanitizeHtml'
import { FormUpdateSchema } from '~/server/utils/schemas'

async function generateUniqueBigIdeaSlug(): Promise<string> {
  const base = 'big-idea-form'
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
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

  const parsed = FormUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
      data: { errors: parsed.error.flatten().fieldErrors },
    })
  }

  const sanitized = parsed.data as Record<string, any>

  const rawSlug = sanitized.slug ? String(sanitized.slug).replace(/[^a-zA-Z0-9_-]/g, '') : ''
  if (!rawSlug) {
    sanitized.slug = await generateUniqueBigIdeaSlug()
  } else {
    sanitized.slug = rawSlug
  }

  if (sanitized.slug) {
    const duplicate = await FormModel.findOne({ slug: sanitized.slug, _id: { $ne: id } }).lean()
    if (duplicate) {
      throw createError({ statusCode: 409, statusMessage: 'Slug already exists' })
    }
  }

  if (sanitized.mainDescription) {
    sanitized.mainDescription = sanitizeHtml(sanitized.mainDescription)
  }

  if (sanitized.fields) {
    for (const field of Object.values(sanitized.fields) as any[]) {
      if (field.inputType === 'display' && field.defaultValue) {
        field.defaultValue = sanitizeHtml(field.defaultValue)
      }
    }
  }

  const form = await FormModel.findByIdAndUpdate(
    id,
    { $set: sanitized },
    { new: true, runValidators: true },
  ).lean()

  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  return form
})
