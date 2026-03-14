export type InputType = 'shortText' | 'longText' | 'select' | 'radio' | 'booleanRadio' | 'toggle' | 'checkbox' | 'checkboxOther' | 'richText' | 'display'

export type ValidationRule = 'email' | 'israeliPhone' | 'numbersOnly' | null

export interface FieldOption {
  value: string
  label: string
}

export interface FieldDefinition {
  key: string
  label: string
  presentationLabel: string
  inputType: InputType
  requiredDefault: boolean
  visibleDefault: boolean
  infoText: string
  placeholder: string
  defaultValue: string
  validation: ValidationRule
  options: FieldOption[]
  page: string
  isInternalOnly?: boolean
  /** Fields that must be mutually exclusive with this one (only one visible at a time) */
  exclusiveWith?: string[]
  fallbackValue?: string
  togglePositiveLabel?: string
  toggleNegativeLabel?: string
  conditionalVisibility?: { dependsOn: string; showWhen: string }
}

export interface FieldConfig {
  key: string
  label: string
  presentationLabel: string
  inputType: InputType
  required: boolean
  visible: boolean
  infoText: string
  placeholder: string
  defaultValue: string
  validation: ValidationRule
  options: FieldOption[]
  fallbackValue?: string
  togglePositiveLabel?: string
  toggleNegativeLabel?: string
  conditionalVisibility?: { dependsOn: string; showWhen: string }
}

export interface FormPage {
  key: string
  title: string
  titleFieldKey: string
  showTitle: boolean
  fields: string[]
}

export interface SpreadsheetInfo {
  id: string
  name: string
  url: string
  folderId?: string
}

export interface FormConfig {
  _id?: string
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
  spreadsheet?: SpreadsheetInfo
  campLandingPageUrl?: string
  columnMappingMode?: 'default' | 'custom'
  columnMapping?: Record<string, string>
  sourceTemplateId?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface FormSubmission {
  _id?: string
  formId: string
  formSlug: string
  formName: string
  company: string
  data: Record<string, any>
  submittedAt?: Date | string
}
