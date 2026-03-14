<template>
  <div class="FormField" :data-field-key="field.key">
    <label :for="`field-${field.key}`" class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required" aria-hidden="true">*</span>
      <span v-if="field.required" class="sr-only">שדה חובה</span>
    </label>
    <textarea
      :id="`field-${field.key}`"
      class="FormField__textarea"
      :class="{ 'FormField__textarea--error': error }"
      :value="modelValue"
      :placeholder="field.placeholder"
      :aria-required="field.required || undefined"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="ariaDescribedby || undefined"
      rows="4"
      dir="rtl"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @blur="$emit('blur')"
    />
    <p v-if="field.infoText" :id="`field-${field.key}-info`" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" :id="`field-${field.key}-error`" role="alert" class="FormField__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig } from '~/types/form'

const props = defineProps<{
  field: FieldConfig
  modelValue: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const ariaDescribedby = computed(() => {
  const ids: string[] = []
  if (props.field.infoText) ids.push(`field-${props.field.key}-info`)
  if (props.error) ids.push(`field-${props.field.key}-error`)
  return ids.join(' ')
})
</script>
