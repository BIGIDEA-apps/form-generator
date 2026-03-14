<template>
  <div class="FormField" :data-field-key="field.key">
    <label :id="`field-${field.key}-label`" class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required" aria-hidden="true">*</span>
      <span v-if="field.required" class="sr-only">שדה חובה</span>
    </label>
    <div class="FormField__toggle-row" dir="rtl">
      <span class="FormField__toggle-label">{{ field.toggleNegativeLabel || '' }}</span>
      <button
        type="button"
        class="FormField__toggle"
        :class="{ 'FormField__toggle--active': modelValue }"
        role="switch"
        :aria-checked="!!modelValue"
        :aria-labelledby="`field-${field.key}-label`"
        :aria-describedby="ariaDescribedby || undefined"
        @click="$emit('update:modelValue', !modelValue)"
        @blur="$emit('blur')"
      >
        <span class="FormField__toggle-track">
          <span class="FormField__toggle-thumb" />
        </span>
      </button>
      <span class="FormField__toggle-label">{{ field.togglePositiveLabel || '' }}</span>
    </div>
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

defineEmits<{
  'update:modelValue': [value: boolean]
  blur: []
}>()

const ariaDescribedby = computed(() => {
  const ids: string[] = []
  if (props.field.infoText) ids.push(`field-${props.field.key}-info`)
  if (props.error) ids.push(`field-${props.field.key}-error`)
  return ids.join(' ')
})
</script>
