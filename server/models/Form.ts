import mongoose, { Schema, type Document } from 'mongoose'
import type { FieldConfig, FormPage } from '~/types/form'

export interface IForm extends Document {
  slug: string
  formName: string
  formTitle: string
  company: string
  primaryLogo: string
  primaryLogoSvgToWhite: boolean
  secondaryLogo: string | null
  secondaryLogoSvgToWhite: boolean
  mainDescription: string
  pages: FormPage[]
  fields: Record<string, FieldConfig>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FieldOptionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
)

const FieldConfigSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, default: '' },
    presentationLabel: { type: String, default: '' },
    inputType: { type: String, required: true },
    required: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    infoText: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    defaultValue: { type: String, default: '' },
    validation: { type: String, default: null },
    options: { type: [FieldOptionSchema], default: [] },
    fallbackValue: { type: String, default: '' },
  },
  { _id: false },
)

const FormPageSchema = new Schema(
  {
    key: { type: String, required: true },
    title: { type: String, default: '' },
    titleFieldKey: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
    fields: { type: [String], default: [] },
  },
  { _id: false },
)

const FormSchema = new Schema<IForm>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    formName: { type: String, required: true },
    formTitle: { type: String, default: '' },
    company: { type: String, default: '' },
    primaryLogo: { type: String, default: '/img/logos/bigidea-logo.png' },
    primaryLogoSvgToWhite: { type: Boolean, default: false },
    secondaryLogo: { type: String, default: null },
    secondaryLogoSvgToWhite: { type: Boolean, default: false },
    mainDescription: { type: String, default: '' },
    pages: { type: [FormPageSchema], default: [] },
    fields: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const FormModel = mongoose.models.Form as mongoose.Model<IForm>
  || mongoose.model<IForm>('Form', FormSchema)
