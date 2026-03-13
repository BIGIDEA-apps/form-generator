import { z } from 'zod'

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
  validation: z.union([z.literal('email'), z.literal('israeliPhone'), z.null()]).default(null),
  options: z.array(FieldOptionSchema).default([]),
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
}

export const FormCreateSchema = z.object(baseFormFields).strict()

export const FormUpdateSchema = z.object({
  ...baseFormFields,
  formName: z.string().min(1).optional(),
}).strict()

export const SubmissionCreateSchema = z.object({
  formId: z.string().min(1, 'formId is required'),
  formSlug: z.string().min(1, 'formSlug is required'),
  data: z.record(z.string(), z.any()),
})
