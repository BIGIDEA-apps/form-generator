<template>
  <div class="FormField">
    <label class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required">*</span>
    </label>
    <div class="FormField__radio-group">
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
    <p v-if="field.infoText" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" class="FormField__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig, FieldOption } from '~/types/form'

defineProps<{
  field: FieldConfig
  modelValue: string
  error?: string
}>()

function optionValue(option: FieldOption, idx: number) {
  return option.value || option.label || `opt-${idx}`
}

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
