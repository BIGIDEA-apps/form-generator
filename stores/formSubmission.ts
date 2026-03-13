import { defineStore } from 'pinia'
import type { FormConfig, FieldConfig } from '~/types/form'
import { validateField } from '~/utils/validators'

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
        .filter((f: FieldConfig | undefined) => f && f.visible)
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
          vals[key] = field.defaultValue || ''
        }
      }
      this.values = vals
    },

    setValue(key: string, value: any) {
      this.values[key] = value
      if (this.errors[key]) {
        delete this.errors[key]
      }
    },

    validateCurrentPage(): boolean {
      const newErrors: Record<string, string> = {}

      for (const field of this.currentPageFields) {
        const value = this.values[field.key]

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
        if (field.visible && this.values[key] !== undefined) {
          data[key] = this.values[key]
        }
      }

      return data
    },

    reset() {
      this.formConfig = null
      this.values = {}
      this.errors = {}
      this.currentPageIndex = 0
      this.submitted = false
      this.submitting = false
    },
  },
})
