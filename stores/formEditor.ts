import { defineStore } from 'pinia'
import type { FieldConfig, FormConfig, FormPage } from '~/types/form'
import { getDefaultFormConfig, FIELD_DEFINITIONS } from '~/utils/fieldDefinitions'

export const useFormEditorStore = defineStore('formEditor', {
  state: () => ({
    form: null as FormConfig | null,
    activePageKey: 'page1',
    isDirty: false,
    isNew: true,
    activeSettingsFieldKey: null as string | null,
    validationErrors: {} as Record<string, string>,
  }),

  getters: {
    hasValidationErrors(): boolean {
      return Object.keys(this.validationErrors).length > 0
    },

    activePage(): FormPage | undefined {
      return this.form?.pages.find(p => p.key === this.activePageKey)
    },

    activePageFields(): FieldConfig[] {
      if (!this.form || !this.activePage) return []
      return this.activePage.fields
        .map(key => this.form!.fields[key])
        .filter(Boolean)
    },

    allPageKeys(): string[] {
      return this.form?.pages.map(p => p.key) || []
    },

    activeSettingsField(): FieldConfig | null {
      if (!this.form || !this.activeSettingsFieldKey) return null
      return this.form.fields[this.activeSettingsFieldKey] || null
    },
  },

  actions: {
    initNew() {
      const defaults = getDefaultFormConfig()
      this.form = { ...defaults } as FormConfig
      this.activePageKey = 'page1'
      this.isDirty = false
      this.isNew = true
    },

    loadExisting(formData: FormConfig) {
      this.form = JSON.parse(JSON.stringify(formData))
      this.activePageKey = this.form!.pages[0]?.key || 'page1'
      this.isDirty = false
      this.isNew = false
    },

    setActivePage(pageKey: string) {
      this.activePageKey = pageKey
    },

    updateFormField(key: string, value: any) {
      if (!this.form) return
      ;(this.form as any)[key] = value
      this.isDirty = true
    },

    updateFieldConfig(fieldKey: string, updates: Partial<FieldConfig>) {
      if (!this.form) return

      const field = this.form.fields[fieldKey]
      if (!field) return

      Object.assign(field, updates)

      if ('visible' in updates) {
        const def = FIELD_DEFINITIONS.find(d => d.key === fieldKey)
        if (def?.exclusiveWith && updates.visible) {
          for (const exclusiveKey of def.exclusiveWith) {
            if (this.form.fields[exclusiveKey]) {
              this.form.fields[exclusiveKey].visible = false
            }
          }
        }
      }

      this.isDirty = true
    },

    updatePageTitle(pageKey: string, title: string) {
      if (!this.form) return
      const page = this.form.pages.find(p => p.key === pageKey)
      if (page) {
        page.title = title
        this.isDirty = true
      }
    },

    updatePageShowTitle(pageKey: string, showTitle: boolean) {
      if (!this.form) return
      const page = this.form.pages.find(p => p.key === pageKey)
      if (page) {
        page.showTitle = showTitle
        this.isDirty = true
      }
    },

    openFieldSettings(fieldKey: string) {
      this.activeSettingsFieldKey = fieldKey
    },

    closeFieldSettings() {
      this.activeSettingsFieldKey = null
    },

    validateField(fieldKey: string): string | null {
      if (!this.form) return null

      const value = String((this.form as any)[fieldKey] ?? '').trim()
      let error: string | null = null

      if (fieldKey === 'formName') {
        if (!value) error = 'נא למלא שם פנימי לטופס'
      } else if (fieldKey === 'formTitle') {
        if (!value) error = 'נא למלא שם הטופס לתצוגה'
      } else if (fieldKey === 'slug') {
        if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
          error = 'כתובת ה-URL יכולה להכיל רק אותיות באנגלית, מספרים, מקף וקו תחתון'
        }
      }

      if (error) {
        this.validationErrors = { ...this.validationErrors, [fieldKey]: error }
        return error
      }

      if (this.validationErrors[fieldKey]) {
        const { [fieldKey]: _, ...rest } = this.validationErrors
        this.validationErrors = rest
      }
      return null
    },

    clearFieldError(fieldKey: string) {
      if (this.validationErrors[fieldKey]) {
        const { [fieldKey]: _, ...rest } = this.validationErrors
        this.validationErrors = rest
      }
    },

    clearAllValidationErrors() {
      this.validationErrors = {}
    },

    validateAll(): boolean {
      this.validateField('formName')
      this.validateField('formTitle')
      this.validateField('slug')
      return !this.hasValidationErrors
    },

    getExportData(): Partial<FormConfig> {
      if (!this.form) return {}
      const { _id, createdAt, updatedAt, ...data } = this.form as any
      return data
    },

    reset() {
      this.form = null
      this.activePageKey = 'page1'
      this.isDirty = false
      this.isNew = true
      this.activeSettingsFieldKey = null
      this.validationErrors = {}
    },
  },
})
