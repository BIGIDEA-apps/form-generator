import { FormModel } from '~/server/models/Form'
import { sanitizeHtml } from '~/server/utils/sanitizeHtml'
import { FormCreateSchema } from '~/server/utils/schemas'

function generateSlug(name: string): string {
  const base = name
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 40)

  const suffix = Date.now().toString(36)
  const raw = base ? `${base}-${suffix}` : suffix
  return raw.replace(/[^a-zA-Z0-9_-]/g, '')
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)

  const parsed = FormCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Invalid request body',
      data: { errors: parsed.error.flatten().fieldErrors },
    })
  }

  const sanitized = parsed.data as Record<string, any>

  const rawSlug = sanitized.slug ? String(sanitized.slug).replace(/[^a-zA-Z0-9_-]/g, '') : ''
  const slug = rawSlug || generateSlug(sanitized.formName)

  const existingSlug = await FormModel.findOne({ slug }).lean()
  if (existingSlug) {
    throw createError({ statusCode: 409, statusMessage: 'Slug already exists' })
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

  const form = await FormModel.create({
    ...sanitized,
    slug,
  })

  return form.toObject()
})
