import { consola } from 'consola'
import { AppSettingsModel } from '~/server/models/AppSettings'
import { FormModel } from '~/server/models/Form'
import { SubmissionModel } from '~/server/models/Submission'
import { requireValidObjectId } from '~/server/utils/objectId'
import { checkRateLimit } from '~/server/utils/rateLimit'
import { SubmissionCreateSchema } from '~/server/utils/schemas'
import { getServiceAccountToken, appendSpreadsheetRow } from '~/server/utils/googleSheets'
import { normalizeEnglishName } from '~/server/utils/normalizeEnglishName'

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

  const formId = requireValidObjectId(event, body.formId, 'formId')
  const form = await FormModel.findById(formId).lean() as any
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

  const ENGLISH_NAME_FIELDS = ['camperFirstNameEn', 'camperLastNameEn', 'parentFirstNameEn', 'parentLastNameEn']
  for (const key of ENGLISH_NAME_FIELDS) {
    if (key in sanitizedData && sanitizedData[key] && typeof sanitizedData[key] === 'string') {
      sanitizedData[key] = normalizeEnglishName(sanitizedData[key])
    }
  }

  for (const [key, field] of Object.entries(formFields) as [string, any][]) {
    if (!field.visible || field.inputType === 'display') continue

    if (field.conditionalVisibility) {
      const dep = formFields[field.conditionalVisibility.dependsOn]
      if (dep && field.conditionalVisibility.showWhen === 'positive' && dep.options?.length >= 2) {
        const positiveVal = dep.options[1].value || dep.options[1].label
        if (sanitizedData[dep.key] !== positiveVal) continue
      }
      else if (dep && sanitizedData[dep.key] !== field.conditionalVisibility.showWhen) {
        continue
      }
    }

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
    formId: form._id,
    formSlug: form.slug,
    formName: form.formName || '',
    company: form.company || '',
    data: sanitizedData,
  })

  if (form.spreadsheet?.id) {
    try {
      let columnMapping: Record<string, string> | undefined

      if (form.columnMappingMode === 'custom' && form.columnMapping && Object.keys(form.columnMapping).length > 0) {
        columnMapping = form.columnMapping
      }
      else {
        const settings = await AppSettingsModel.findOne({ key: 'singleton' }).select('columnMapping').lean()
        if (settings?.columnMapping && Object.keys(settings.columnMapping).length > 0) {
          columnMapping = settings.columnMapping as Record<string, string>
        }
      }

      if (columnMapping) {
        const resolvedCompany = form.company
          || sanitizedData.companyByUserString
          || sanitizedData.companyByUserSelect
          || ''

        const rowData: Record<string, any> = {
          ...sanitizedData,
          submissionId: String(submission._id),
          formName: form.formName || '',
          company: resolvedCompany,
          submittedAt: new Date().toISOString(),
        }

        const token = await getServiceAccountToken()
        await appendSpreadsheetRow(token, form.spreadsheet.id, columnMapping, rowData)
      }
    }
    catch (err: any) {
      consola.error('Failed to write submission to spreadsheet:', err?.message || err)
    }
  }

  return { success: true, id: submission._id }
})
