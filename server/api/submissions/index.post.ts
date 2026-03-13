import { FormModel } from '~/server/models/Form'
import { SubmissionModel } from '~/server/models/Submission'
import { checkRateLimit } from '~/server/utils/rateLimit'
import { SubmissionCreateSchema } from '~/server/utils/schemas'

function validateIsraeliPhone(value: string): boolean {
  if (!value) return false
  const cleaned = value.replace(/[\s\-()]/g, '')
  return /^(0[2-9]\d{7,8}|(\+972)[2-9]\d{7,8})$/.test(cleaned)
}

function validateEmail(value: string): boolean {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateNumbersOnly(value: string): boolean {
  if (!value) return false
  return /^\d+$/.test(value)
}

// TODO: Consider adding Cloudflare Turnstile or reCAPTCHA for bot protection

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { maxRequests: 5, windowMs: 60_000 })

  const body = await readBody(event)

  const parsed = SubmissionCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Invalid request body',
      data: { errors: parsed.error.flatten().fieldErrors },
    })
  }

  const form = await FormModel.findById(body.formId).lean() as any
  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  }

  if (!form.isActive) {
    throw createError({ statusCode: 403, statusMessage: 'Form is not active' })
  }

  const formFields = form.fields as Record<string, any>
  const validKeys = new Set(Object.keys(formFields))
  const errors: Record<string, string> = {}

  const sanitizedData: Record<string, any> = {}
  for (const [key, value] of Object.entries(body.data)) {
    if (validKeys.has(key)) {
      sanitizedData[key] = value
    }
  }

  for (const [key, field] of Object.entries(formFields) as [string, any][]) {
    if (!field.visible || field.inputType === 'display') continue

    const value = sanitizedData[key]

    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[key] = `${field.label || key} is required`
      continue
    }

    if (value && field.validation) {
      if (field.validation === 'email' && !validateEmail(String(value))) {
        errors[key] = `${field.label || key} has an invalid email`
      }
      if (field.validation === 'israeliPhone' && !validateIsraeliPhone(String(value))) {
        errors[key] = `${field.label || key} has an invalid phone number`
      }
      if (field.validation === 'numbersOnly' && !validateNumbersOnly(String(value))) {
        errors[key] = `${field.label || key} must contain only digits`
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: { errors },
    })
  }

  const submission = await SubmissionModel.create({
    formId: body.formId,
    formSlug: body.formSlug,
    data: sanitizedData,
  })

  return { success: true, id: submission._id }
})
