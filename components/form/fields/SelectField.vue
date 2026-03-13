<template>
  <div class="FormField">
    <label class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required">*</span>
    </label>
    <p v-if="field.infoText" class="FormField__info">{{ field.infoText }}</p>
    <div class="FormField__select-wrapper">
      <select
        class="FormField__select"
        :class="{ 'FormField__select--error': error }"
        :value="modelValue"
        dir="rtl"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>
          {{ field.placeholder || 'בחרו אפשרות' }}
        </option>
        <option
          v-for="option in field.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <svg class="FormField__select-chevron" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </div>
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
