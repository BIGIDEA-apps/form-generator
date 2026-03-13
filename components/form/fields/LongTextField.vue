<template>
  <div class="FormField">
    <label class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required">*</span>
    </label>
    <textarea
      class="FormField__textarea"
      :class="{ 'FormField__textarea--error': error }"
      :value="modelValue"
      :placeholder="field.placeholder"
      rows="4"
      dir="rtl"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="field.infoText" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" class="FormField__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig } from '~/types/form'

defineProps<{
  field: FieldConfig
  modelValue: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
