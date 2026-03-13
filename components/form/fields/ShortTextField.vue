<template>
  <div class="FormField">
    <label class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required">*</span>
    </label>
    <p v-if="field.infoText" class="FormField__info">{{ field.infoText }}</p>
    <input
      type="text"
      class="FormField__input"
      :class="{ 'FormField__input--error': error }"
      :value="modelValue"
      :placeholder="field.placeholder"
      dir="rtl"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
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
