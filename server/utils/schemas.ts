import { z } from 'zod'
import { normalizeWebAddress } from '~/utils/urlUtils'

const FieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const FieldConfigSchema = z.object({
  key: z.string(),
  label: z.string().default(''),
  presentationLabel: z.string().default(''),
  inputType: z.string(),
  required: z.boolean().default(false),
  visible: z.boolean().default(true),
  infoText: z.string().default(''),
  placeholder: z.string().default(''),
  defaultValue: z.string().default(''),
  validation: z.union([z.literal('email'), z.literal('israeliPhone'), z.literal('numbersOnly'), z.null()]).default(null),
  options: z.array(FieldOptionSchema).default([]),
  fallbackValue: z.string().default(''),
  togglePositiveLabel: z.string().default(''),
  toggleNegativeLabel: z.string().default(''),
  conditionalVisibility: z.object({
    dependsOn: z.string(),
    showWhen: z.string(),
  }).optional(),
})

const FormPageSchema = z.object({
  key: z.string(),
  title: z.string().default(''),
  titleFieldKey: z.string().default(''),
  showTitle: z.boolean().default(true),
  fields: z.array(z.string()).default([]),
})

const baseFormFields = {
  slug: z.string().regex(/^[a-zA-Z0-9_-]*$/).optional(),
  formName: z.string().min(1, 'formName is required'),
  formTitle: z.string().optional(),
  company: z.string().optional(),
  primaryLogo: z.string().optional(),
  primaryLogoSvgToWhite: z.boolean().optional(),
  secondaryLogo: z.string().nullable().optional(),
  secondaryLogoSvgToWhite: z.boolean().optional(),
  mainDescription: z.string().optional(),
  pages: z.array(FormPageSchema).optional(),
  fields: z.record(z.string(), FieldConfigSchema).optional(),
  isActive: z.boolean().optional(),
  spreadsheet: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    folderId: z.string().optional(),
  }).optional(),
  campLandingPageUrl: z
    .string()
    .optional()
    .transform((val) => {
      const trimmed = (val ?? '').trim()
      if (!trimmed) return ''
      const normalized = normalizeWebAddress(trimmed)
      return normalized ?? trimmed
    })
    .refine((val) => !val || normalizeWebAddress(val), 'כתובת URL לא תקינה'),
  columnMappingMode: z.enum(['default', 'custom']).optional(),
  columnMapping: z.record(z.string(), z.string()).optional(),
  sourceTemplateId: z.string().optional(),
  successTitle: z.string().optional(),
  successMessage: z.string().optional(),
}

export const FormCreateSchema = z.object(baseFormFields).strip()

export const FormUpdateSchema = z.object({
  ...baseFormFields,
  formName: z.string().min(1).optional(),
}).strip()

export const SubmissionCreateSchema = z.object({
  formId: z.string().min(1, 'formId is required'),
  formSlug: z.string().min(1, 'formSlug is required'),
  data: z.record(z.string(), z.any()),
})
