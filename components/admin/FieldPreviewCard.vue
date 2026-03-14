<template>
  <div
    class="FieldPreviewCard"
    :class="{
      'FieldPreviewCard--disabled': isDisabledByMainCompany,
      'FieldPreviewCard--header-only': isHeaderOnly,
    }"
  >
    <div class="FieldPreviewCard__content">
      <div class="FieldPreviewCard__toolbar">
      <div class="FieldPreviewCard__toolbar-right" dir="rtl">
        <UToggle
          :model-value="field.visible"
          size="sm"
          :disabled="isDisabledByMainCompany"
          @update:model-value="emit('update', field.key, { visible: $event })"
        />
        <span class="FieldPreviewCard__field-label">{{ field.label }}</span>
      </div>

      <div class="FieldPreviewCard__toolbar-left">
        <div v-if="field.inputType !== 'display'" class="FieldPreviewCard__toggle-group">
          <span class="FieldPreviewCard__toggle-label">חובה</span>
          <UToggle
            :model-value="field.required"
            size="sm"
            :disabled="isDisabledByMainCompany"
            @update:model-value="emit('update', field.key, { required: $event })"
          />
        </div>

        <UButton
          icon="i-heroicons-cog-6-tooth"
          variant="ghost"
          color="gray"
          size="xs"
          @click="emit('openSettings', field.key)"
        />
      </div>
    </div>

    <div class="FieldPreviewCard__body" :class="{ 'FieldPreviewCard__body--collapsed': isHeaderOnly }">
    <div v-if="field.visible" class="FieldPreviewCard__preview">
      <div class="FieldPreviewCard__preview-inner">
        <template v-if="field.inputType === 'display'">
          <div
            :class="[
              'FormPage__display-text',
              isRichTextDisplayField(field.key) ? 'FormPage__rich-text' : '',
            ]"
          >
            <span v-if="isRichTextDisplayField(field.key) && field.defaultValue?.startsWith?.('<')" v-html="field.defaultValue" />
            <template v-else>{{ field.defaultValue }}</template>
          </div>
        </template>

        <ShortTextField
          v-else-if="field.inputType === 'shortText'"
          :field="field"
          model-value=""
        />

        <LongTextField
          v-else-if="field.inputType === 'longText'"
          :field="field"
          model-value=""
        />

        <SelectField
          v-else-if="field.inputType === 'select'"
          :field="field"
          model-value=""
        />

        <RadioField
          v-else-if="field.inputType === 'radio'"
          :field="field"
          model-value=""
        />

        <ToggleField
          v-else-if="field.inputType === 'toggle'"
          :field="field"
          :model-value="false"
        />

        <CheckboxField
          v-else-if="field.inputType === 'checkbox'"
          :field="field"
          :model-value="false"
        />
      </div>
    </div>
    <div v-if="(field.key === 'campSession' || field.key === 'campRound') && !field.visible && field.fallbackValue" class="FieldPreviewCard__fallback-info" dir="rtl">
      {{ field.key === 'campRound' ? 'סבב דיפולטיבי' : 'מחזור דיפולטיבי' }}: {{ field.fallbackValue }}
    </div>
    </div>
    </div>
    <UTooltip v-if="isDisabledByMainCompany" text="The company name has already been selected in the main form settings.">
      <div class="FieldPreviewCard__disable-overlay" />
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig } from '~/types/form'
import ShortTextField from '~/components/form/fields/ShortTextField.vue'
import LongTextField from '~/components/form/fields/LongTextField.vue'
import SelectField from '~/components/form/fields/SelectField.vue'
import RadioField from '~/components/form/fields/RadioField.vue'
import ToggleField from '~/components/form/fields/ToggleField.vue'
import CheckboxField from '~/components/form/fields/CheckboxField.vue'

const props = defineProps<{
  field: FieldConfig
  isDisabledByMainCompany?: boolean
}>()

const FALLBACK_FIELD_KEYS = ['campSession', 'campRound'] as const

const isHeaderOnly = computed(() => {
  if (props.field.visible) return false
  const isFallbackField = FALLBACK_FIELD_KEYS.includes(props.field.key as (typeof FALLBACK_FIELD_KEYS)[number])
  const hasFallbackValue = Boolean(props.field.fallbackValue?.trim())
  return !isFallbackField || !hasFallbackValue
})

const RICH_TEXT_DISPLAY_FIELDS = ['mainDescription', 'page2MainText', 'page3MainText', 'page2AppendixText', 'page3AppendixText']

function isRichTextDisplayField(key: string) {
  return RICH_TEXT_DISPLAY_FIELDS.includes(key)
}

const emit = defineEmits<{
  update: [fieldKey: string, updates: Partial<FieldConfig>]
  openSettings: [fieldKey: string]
}>()
</script>

<style>
.FieldPreviewCard {
  position: relative;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: opacity 0.2s;
}

.FieldPreviewCard--disabled {
  opacity: 0.6;
}

.FieldPreviewCard__disable-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  cursor: not-allowed;
}

.FieldPreviewCard__fallback-info {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  padding: 0.375rem 1rem;
  background: var(--ui-bg-elevated);
  border-top: 1px dashed var(--ui-border);
}

.FieldPreviewCard__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  background: var(--ui-bg-elevated);
  border-bottom: 1px solid var(--ui-border);
}

.FieldPreviewCard--header-only {
  height: 48px;
  min-height: 48px;
  max-height: 48px;
}

.FieldPreviewCard--header-only .FieldPreviewCard__content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.FieldPreviewCard--header-only .FieldPreviewCard__toolbar {
  flex-shrink: 0;
  border-bottom: none;
}

.FieldPreviewCard--header-only .FieldPreviewCard__body {
  display: none;
}

.FieldPreviewCard__toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.FieldPreviewCard__field-label {
  font-size: 0.875rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.FieldPreviewCard__toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.FieldPreviewCard__toggle-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.FieldPreviewCard__toggle-label {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  white-space: nowrap;
}

/* Preview matches public form UI at ~2/3 scale */
.FieldPreviewCard__preview {
  background: var(--color-brand-bg);
  padding: 1rem 1.5rem;
  pointer-events: none;
  user-select: none;
  direction: rtl;
  font-family: 'almoni-dl-aaa', sans-serif;
  zoom: 0.67;
}

/* Same sizing as PublicFormPage */
.FieldPreviewCard__preview .FormField__label {
  font-size: 26px;
}

.FieldPreviewCard__preview .FormField__info {
  font-size: 16px;
}

/* Override AdminLayout input styles – preview must use front form appearance */
.FieldPreviewCard__preview .FormField__input,
.FieldPreviewCard__preview .FormField__textarea,
.FieldPreviewCard__preview .FormField__select-trigger {
  background: var(--color-brand-input-bg) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: var(--color-brand-white) !important;
  font-size: 22px;
  padding: 0.75rem 1rem;
  box-shadow: none !important;
}

.FieldPreviewCard__preview .FormField__input::placeholder,
.FieldPreviewCard__preview .FormField__textarea::placeholder {
  color: rgba(255, 255, 255, 0.4) !important;
}

.FieldPreviewCard__preview .FormField__error {
  font-size: 16px;
}

.FieldPreviewCard__preview .FormField__radio-option {
  font-size: 22px;
}

.FieldPreviewCard__preview .FormField__textarea {
  resize: none;
}

.FieldPreviewCard__preview .FormPage__display-text {
  color: var(--color-brand-white);
  font-size: 22px;
  text-align: right;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

.FieldPreviewCard__preview .FormPage__rich-text strong { font-weight: 700; }
.FieldPreviewCard__preview .FormPage__rich-text em { font-style: italic; }
.FieldPreviewCard__preview .FormPage__rich-text u { text-decoration: underline; }
.FieldPreviewCard__preview .FormPage__rich-text s { text-decoration: line-through; }
.FieldPreviewCard__preview .FormPage__rich-text ul { list-style-type: disc; padding-inline-start: 1.5rem; margin: 0.25rem 0; }
.FieldPreviewCard__preview .FormPage__rich-text ol { list-style-type: decimal; padding-inline-start: 1.5rem; margin: 0.25rem 0; }
.FieldPreviewCard__preview .FormPage__rich-text li { margin-bottom: 0.25rem; }
.FieldPreviewCard__preview .FormPage__rich-text p { margin: 0 0 0.5rem; }
.FieldPreviewCard__preview .FormPage__rich-text p:last-child { margin-bottom: 0; }
</style>
