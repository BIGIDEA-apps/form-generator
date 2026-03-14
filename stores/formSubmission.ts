import { defineStore } from 'pinia'
import type { FormConfig, FieldConfig } from '~/types/form'
import { validateField } from '~/utils/validators'
import { normalizeEnglishName } from '~/utils/normalizeEnglishName'

const OTHER_KEY = '__other__'

const ENGLISH_NAME_FIELDS = ['camperFirstNameEn', 'camperLastNameEn', 'parentFirstNameEn', 'parentLastNameEn'] as const

const BLUR_VALIDATION_DELAY_MS = 150
const CHOICE_FIELD_TYPES = ['select', 'radio', 'booleanRadio', 'checkboxOther'] as const
const blurValidationTimeouts: Record<string, ReturnType<typeof setTimeout>> = {}

function isCheckboxOtherEmpty(value: any): boolean {
  if (!value || typeof value !== 'object') return true
  const sel = value.selected as string[] | undefined
  return !sel || sel.length === 0
}

function checkboxOtherHasEmptyOther(value: any): boolean {
  if (!value || typeof value !== 'object') return false
  const sel = value.selected as string[] | undefined
  if (!sel?.includes(OTHER_KEY)) return false
  return !value.otherText || !String(value.otherText).trim()
}

function serializeCheckboxOther(value: any): string {
  if (!value || typeof value !== 'object') return ''
  const sel = (value.selected as string[]) || []
  const parts: string[] = []
  for (const s of sel) {
    if (s === OTHER_KEY) {
      if (value.otherText && String(value.otherText).trim()) {
        parts.push(String(value.otherText).trim())
      }
    }
    else {
      parts.push(s)
    }
  }
  return parts.join(', ')
}

function isConditionallyVisible(field: FieldConfig, allFields: Record<string, FieldConfig>, values: Record<string, any>): boolean {
  if (!field.conditionalVisibility) return true
  const dep = allFields[field.conditionalVisibility.dependsOn]
  if (!dep || !dep.visible) return false
  if (field.conditionalVisibility.showWhen === 'positive' && dep.options.length >= 2) {
    return values[dep.key] === (dep.options[1].value || dep.options[1].label)
  }
  return values[dep.key] === field.conditionalVisibility.showWhen
}

export const useFormSubmissionStore = defineStore('formSubmission', {
  state: () => ({
    formConfig: null as FormConfig | null,
    values: {} as Record<string, any>,
    errors: {} as Record<string, string>,
    currentPageIndex: 0,
    submitted: false,
    submitting: false,
  }),

  getters: {
    currentPage() {
      if (!this.formConfig) return null
      return this.formConfig.pages[this.currentPageIndex] || null
    },

    currentPageFields(): FieldConfig[] {
      if (!this.formConfig || !this.currentPage) return []
      return (this.currentPage as any).fields
        .map((key: string) => this.formConfig!.fields[key])
        .filter((f: FieldConfig | undefined) => {
          if (!f || !f.visible) return false
          return isConditionallyVisible(f, this.formConfig!.fields, this.values)
        })
    },

    totalPages(): number {
      return this.formConfig?.pages.length || 0
    },

    isFirstPage(): boolean {
      return this.currentPageIndex === 0
    },

    isLastPage(): boolean {
      return this.currentPageIndex === this.totalPages - 1
    },

    hasVisibleFieldsOnCurrentPage(): boolean {
      return this.currentPageFields.length > 0
    },
  },

  actions: {
    init(config: FormConfig) {
      this.formConfig = config
      this.currentPageIndex = 0
      this.submitted = false
      this.submitting = false
      this.errors = {}

      const vals: Record<string, any> = {}
      for (const [key, field] of Object.entries(config.fields)) {
        if (field.visible) {
          if (field.inputType === 'toggle' || field.inputType === 'checkbox') {
            vals[key] = field.defaultValue === 'true' || field.defaultValue === '1'
          }
          else if (field.inputType === 'checkboxOther') {
            vals[key] = { selected: [], otherText: '' }
          }
          else {
            vals[key] = field.defaultValue || ''
          }
        }
      }
      this.values = vals
    },

    setValue(key: string, value: any) {
      if (blurValidationTimeouts[key]) {
        clearTimeout(blurValidationTimeouts[key])
        delete blurValidationTimeouts[key]
      }
      this.values[key] = value
      if (this.errors[key]) {
        delete this.errors[key]
      }

      if (this.formConfig) {
        for (const [fKey, f] of Object.entries(this.formConfig.fields)) {
          if (f.conditionalVisibility?.dependsOn === key) {
            if (!isConditionallyVisible(f, this.formConfig.fields, this.values)) {
              if (f.inputType === 'checkboxOther') {
                this.values[fKey] = { selected: [], otherText: '' }
              }
              else {
                this.values[fKey] = ''
              }
              delete this.errors[fKey]
            }
          }
        }
      }
    },

    validateFieldOnBlur(key: string) {
      const field = this.formConfig?.fields[key]
      if (!field) return

      const runValidation = () => {
        if (!this.formConfig?.fields[key]) return

        const f = this.formConfig.fields[key]
        if (f.conditionalVisibility && !isConditionallyVisible(f, this.formConfig.fields, this.values)) {
          delete this.errors[key]
          return
        }

        if (ENGLISH_NAME_FIELDS.includes(key as typeof ENGLISH_NAME_FIELDS[number])) {
          const raw = this.values[key]
          if (raw && typeof raw === 'string' && raw.trim()) {
            const normalized = normalizeEnglishName(raw)
            if (normalized !== raw) {
              this.values[key] = normalized
            }
          }
        }

        const value = this.values[key]

        if (f.inputType === 'checkboxOther') {
          if (f.required && isCheckboxOtherEmpty(value)) {
            this.errors[key] = 'שדה חובה'
            return
          }
          if (checkboxOtherHasEmptyOther(value)) {
            this.errors[key] = 'נא לפרט'
            return
          }
          delete this.errors[key]
          return
        }

        const isEmpty = value === undefined || value === null || (typeof value === 'string' && !value.trim())

        if (f.required && isEmpty) {
          this.errors[key] = 'שדה חובה'
          return
        }

        if (value && f.validation) {
          const validationError = validateField(String(value), f.validation)
          if (validationError) {
            this.errors[key] = validationError
            return
          }
        }

        if (this.errors[key]) {
          delete this.errors[key]
        }
      }

      if (CHOICE_FIELD_TYPES.includes(field.inputType as typeof CHOICE_FIELD_TYPES[number])) {
        if (blurValidationTimeouts[key]) {
          clearTimeout(blurValidationTimeouts[key])
        }
        blurValidationTimeouts[key] = setTimeout(() => {
          delete blurValidationTimeouts[key]
          runValidation()
        }, BLUR_VALIDATION_DELAY_MS)
      }
      else {
        runValidation()
      }
    },

    validateCurrentPage(): boolean {
      const newErrors: Record<string, string> = {}

      for (const field of this.currentPageFields) {
        const value = this.values[field.key]

        if (field.inputType === 'checkboxOther') {
          if (field.required && isCheckboxOtherEmpty(value)) {
            newErrors[field.key] = 'שדה חובה'
            continue
          }
          if (checkboxOtherHasEmptyOther(value)) {
            newErrors[field.key] = 'נא לפרט'
            continue
          }
          continue
        }

        if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
          newErrors[field.key] = 'שדה חובה'
          continue
        }

        if (value && field.validation) {
          const validationError = validateField(String(value), field.validation)
          if (validationError) {
            newErrors[field.key] = validationError
          }
        }
      }

      this.errors = { ...this.errors, ...newErrors }

      for (const field of this.currentPageFields) {
        if (!newErrors[field.key] && this.errors[field.key]) {
          delete this.errors[field.key]
        }
      }

      return Object.keys(newErrors).length === 0
    },

    nextPage(): boolean {
      if (!this.validateCurrentPage()) return false

      if (this.currentPageIndex < this.totalPages - 1) {
        this.currentPageIndex++

        if (!this.hasVisibleFieldsOnCurrentPage && !this.isLastPage) {
          return this.nextPage()
        }
      }

      return true
    },

    prevPage() {
      if (this.currentPageIndex > 0) {
        this.currentPageIndex--

        if (!this.hasVisibleFieldsOnCurrentPage && !this.isFirstPage) {
          this.prevPage()
        }
      }
    },

    getSubmissionData(): Record<string, any> {
      const data: Record<string, any> = {}
      if (!this.formConfig) return data

      for (const [key, field] of Object.entries(this.formConfig.fields)) {
        if (field.inputType === 'display') continue

        if (field.visible) {
          if (field.conditionalVisibility && !isConditionallyVisible(field, this.formConfig.fields, this.values)) {
            data[key] = null
            continue
          }
          if (field.inputType === 'checkboxOther') {
            data[key] = serializeCheckboxOther(this.values[key])
          }
          else if (ENGLISH_NAME_FIELDS.includes(key as typeof ENGLISH_NAME_FIELDS[number])) {
            const val = this.values[key]
            data[key] = (val && typeof val === 'string') ? normalizeEnglishName(val) : (val ?? null)
          }
          else {
            data[key] = this.values[key] ?? null
          }
        }
        else if (typeof field.fallbackValue === 'string') {
          data[key] = field.fallbackValue
        }
        else {
          data[key] = null
        }
      }

      return data
    },

    reset() {
      for (const k of Object.keys(blurValidationTimeouts)) {
        clearTimeout(blurValidationTimeouts[k])
        delete blurValidationTimeouts[k]
      }
      this.formConfig = null
      this.values = {}
      this.errors = {}
      this.currentPageIndex = 0
      this.submitted = false
      this.submitting = false
    },
  },
})
