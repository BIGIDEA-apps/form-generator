<template>
  <div class="FormField">
    <label class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required">*</span>
    </label>
    <button
      type="button"
      class="FormField__toggle"
      :class="{ 'FormField__toggle--active': modelValue }"
      role="switch"
      :aria-checked="!!modelValue"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span class="FormField__toggle-track">
        <span class="FormField__toggle-thumb" />
      </span>
    </button>
    <p v-if="field.infoText" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" class="FormField__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig } from '~/types/form'

defineProps<{
  field: FieldConfig
  modelValue: boolean
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
