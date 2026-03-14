<template>
  <div class="FormField" :data-field-key="field.key">
    <label :id="`field-${field.key}-label`" class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required" aria-hidden="true">*</span>
      <span v-if="field.required" class="sr-only">שדה חובה</span>
    </label>
    <div
      class="FormField__radio-group"
      role="radiogroup"
      :aria-labelledby="`field-${field.key}-label`"
      :aria-required="field.required || undefined"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="ariaDescribedby || undefined"
      @focusout="handleFocusOut"
    >
      <label
        v-for="(option, idx) in field.options"
        :key="optionValue(option, idx)"
        class="FormField__radio-option"
      >
        <input
          type="radio"
          :name="field.key"
          :value="optionValue(option, idx)"
          :checked="modelValue === optionValue(option, idx)"
          class="FormField__radio-input"
          @change="$emit('update:modelValue', optionValue(option, idx))"
        >
        <span class="FormField__radio-custom" />
        <span class="FormField__radio-label">{{ option.label || option.value }}</span>
      </label>
    </div>
    <p v-if="field.infoText" :id="`field-${field.key}-info`" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" :id="`field-${field.key}-error`" role="alert" class="FormField__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig, FieldOption } from '~/types/form'

const props = defineProps<{
  field: FieldConfig
  modelValue: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

function optionValue(option: FieldOption, idx: number) {
  return option.value || option.label || `opt-${idx}`
}

const ariaDescribedby = computed(() => {
  const ids: string[] = []
  if (props.field.infoText) ids.push(`field-${props.field.key}-info`)
  if (props.error) ids.push(`field-${props.field.key}-error`)
  return ids.join(' ')
})

function handleFocusOut(e: FocusEvent) {
  const container = e.currentTarget as HTMLElement
  if (!container.contains(e.relatedTarget as Node)) {
    emit('blur')
  }
}
</script>
