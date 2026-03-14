<template>
  <div class="FormField" :data-field-key="field.key" @focusout="handleFocusOut">
    <label class="FormField__checkbox-option">
      <input
        :id="`field-${field.key}`"
        type="checkbox"
        class="FormField__checkbox-input"
        :checked="modelValue"
        :aria-required="field.required || undefined"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="ariaDescribedby || undefined"
        @change="handleChange"
      >
      <span class="FormField__checkbox-custom" />
      <span class="FormField__checkbox-label">
        {{ field.presentationLabel }}
        <span v-if="field.required" class="FormField__required" aria-hidden="true">*</span>
        <span v-if="field.required" class="sr-only">שדה חובה</span>
      </span>
    </label>
    <p v-if="field.infoText" :id="`field-${field.key}-info`" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" :id="`field-${field.key}-error`" role="alert" class="FormField__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig } from '~/types/form'

const props = defineProps<{
  field: FieldConfig
  modelValue: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  blur: []
}>()

function handleChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}

function handleFocusOut(e: FocusEvent) {
  const container = e.currentTarget as HTMLElement
  if (!container.contains(e.relatedTarget as Node)) {
    emit('blur')
  }
}

const ariaDescribedby = computed(() => {
  const ids: string[] = []
  if (props.field.infoText) ids.push(`field-${props.field.key}-info`)
  if (props.error) ids.push(`field-${props.field.key}-error`)
  return ids.join(' ')
})
</script>
