<template>
  <div class="FormField">
    <label class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required">*</span>
    </label>
    <p v-if="field.infoText" class="FormField__info">{{ field.infoText }}</p>
    <div class="FormField__radio-group">
      <label
        v-for="option in field.options"
        :key="option.value"
        class="FormField__radio-option"
      >
        <input
          type="radio"
          :name="field.key"
          :value="option.value"
          :checked="modelValue === option.value"
          class="FormField__radio-input"
          @change="$emit('update:modelValue', option.value)"
        >
        <span class="FormField__radio-custom" />
        <span class="FormField__radio-label">{{ option.label }}</span>
      </label>
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
