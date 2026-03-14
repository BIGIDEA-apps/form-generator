<template>
  <div class="FormField CheckboxField">
    <label class="CheckboxField__row">
      <input
        type="checkbox"
        class="CheckboxField__input"
        :checked="modelValue"
        :aria-checked="!!modelValue"
        @change="handleChange"
      >
      <span class="CheckboxField__label">
        {{ field.presentationLabel }}
        <span v-if="field.required" class="FormField__required">*</span>
      </span>
    </label>
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

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function handleChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>

<style>
.CheckboxField__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--color-brand-white);
}

.CheckboxField__input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--color-brand-primary);
  flex-shrink: 0;
}

.CheckboxField__label {
  flex: 1;
}
</style>
