<template>
  <div class="FieldPreviewCard">
    <div class="FieldPreviewCard__toolbar">
      <div class="FieldPreviewCard__toolbar-right" dir="rtl">
        <UToggle
          :model-value="field.visible"
          size="sm"
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

    <div v-if="field.visible" class="FieldPreviewCard__preview">
      <div class="FieldPreviewCard__preview-inner">
        <template v-if="field.inputType === 'display'">
          <div class="FormPage__display-text">
            {{ field.defaultValue }}
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig } from '~/types/form'
import ShortTextField from '~/components/form/fields/ShortTextField.vue'
import LongTextField from '~/components/form/fields/LongTextField.vue'
import SelectField from '~/components/form/fields/SelectField.vue'
import RadioField from '~/components/form/fields/RadioField.vue'
import ToggleField from '~/components/form/fields/ToggleField.vue'

const props = defineProps<{
  field: FieldConfig
}>()

const emit = defineEmits<{
  update: [fieldKey: string, updates: Partial<FieldConfig>]
  openSettings: [fieldKey: string]
}>()
</script>

<style>
.FieldPreviewCard {
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: opacity 0.2s;
}

.FieldPreviewCard__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  background: var(--ui-bg-elevated);
  border-bottom: 1px solid var(--ui-border);
}

.FieldPreviewCard__toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.FieldPreviewCard__field-label {
  font-size: 0.875rem;
  font-weight: 600;
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

.FieldPreviewCard__preview {
  background: var(--color-brand-bg);
  padding: 1.25rem 1.5rem;
  pointer-events: none;
  user-select: none;
}

/* FormField styles replicated for admin preview context */
.FieldPreviewCard__preview .FormField {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: right;
}

.FieldPreviewCard__preview .FormField__label {
  color: var(--color-brand-white);
  font-size: 1rem;
  font-weight: 700;
}

.FieldPreviewCard__preview .FormField__required {
  color: var(--color-brand-primary);
}

.FieldPreviewCard__preview .FormField__info {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  margin: 0;
}

.FieldPreviewCard__preview .FormField__input,
.FieldPreviewCard__preview .FormField__textarea,
.FieldPreviewCard__preview .FormField__select {
  width: 100%;
  background: var(--color-brand-input-bg);
  color: var(--color-brand-white);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
}

.FieldPreviewCard__preview .FormField__input::placeholder,
.FieldPreviewCard__preview .FormField__textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.FieldPreviewCard__preview .FormField__textarea {
  resize: none;
  min-height: 4rem;
}

.FieldPreviewCard__preview .FormField__select-wrapper {
  position: relative;
}

.FieldPreviewCard__preview .FormField__select {
  appearance: none;
  cursor: default;
  padding-left: 2rem;
}

.FieldPreviewCard__preview .FormField__select-chevron {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.FieldPreviewCard__preview .FormField__radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.FieldPreviewCard__preview .FormField__radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-brand-white);
  font-size: 0.875rem;
}

.FieldPreviewCard__preview .FormField__radio-input {
  display: none;
}

.FieldPreviewCard__preview .FormField__radio-custom {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  flex-shrink: 0;
}

.FieldPreviewCard__preview .FormField__toggle {
  background: none;
  border: none;
  padding: 0;
}

.FieldPreviewCard__preview .FormField__toggle-track {
  display: block;
  width: 2.5rem;
  height: 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  position: relative;
}

.FieldPreviewCard__preview .FormField__toggle-thumb {
  position: absolute;
  top: 0.125rem;
  right: 0.125rem;
  width: 1rem;
  height: 1rem;
  background: white;
  border-radius: 50%;
}

.FieldPreviewCard__preview .FormPage__display-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  text-align: right;
}
</style>
