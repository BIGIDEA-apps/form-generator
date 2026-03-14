<template>
  <div class="FormField CheckboxOtherField" :data-field-key="field.key" @focusout="handleBlur">
    <label :id="`field-${field.key}-label`" class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required" aria-hidden="true">*</span>
      <span v-if="field.required" class="sr-only">שדה חובה</span>
    </label>
    <div
      class="FormField__radio-group"
      role="group"
      :aria-labelledby="`field-${field.key}-label`"
      :aria-required="field.required || undefined"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="ariaDescribedby || undefined"
    >
      <label
        v-for="option in field.options"
        :key="option.value || option.label"
        class="FormField__checkbox-option"
      >
        <input
          type="checkbox"
          class="FormField__checkbox-input"
          :checked="selected.includes(option.value || option.label)"
          @change="toggleOption(option.value || option.label)"
        >
        <span class="FormField__checkbox-custom" />
        <span class="FormField__checkbox-label">{{ option.label || option.value }}</span>
      </label>
      <label class="FormField__checkbox-option">
        <input
          type="checkbox"
          class="FormField__checkbox-input"
          :checked="otherChecked"
          @change="toggleOther"
        >
        <span class="FormField__checkbox-custom" />
        <span class="FormField__checkbox-label">אחר (נא לפרט)</span>
      </label>
      <input
        v-if="otherChecked"
        type="text"
        class="FormField__input CheckboxOtherField__other-input"
        :class="{ 'FormField__input--error': otherError }"
        :value="otherText"
        placeholder="נא לפרט..."
        aria-label="פרט אחר"
        @input="handleOtherInput"
      >
    </div>
    <p v-if="field.infoText" :id="`field-${field.key}-info`" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" :id="`field-${field.key}-error`" role="alert" class="FormField__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig } from '~/types/form'

const OTHER_KEY = '__other__'

const props = defineProps<{
  field: FieldConfig
  modelValue: { selected: string[]; otherText: string }
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { selected: string[]; otherText: string }]
  blur: []
}>()

const selected = computed(() => props.modelValue?.selected ?? [])
const otherText = computed(() => props.modelValue?.otherText ?? '')
const otherChecked = computed(() => selected.value.includes(OTHER_KEY))
const otherError = computed(() => otherChecked.value && !otherText.value.trim())

const ariaDescribedby = computed(() => {
  const ids: string[] = []
  if (props.field.infoText) ids.push(`field-${props.field.key}-info`)
  if (props.error) ids.push(`field-${props.field.key}-error`)
  return ids.join(' ')
})

function toggleOption(val: string) {
  const current = [...selected.value]
  const idx = current.indexOf(val)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(val)
  emit('update:modelValue', { selected: current, otherText: otherText.value })
}

function toggleOther() {
  const current = [...selected.value]
  const idx = current.indexOf(OTHER_KEY)
  if (idx >= 0) {
    current.splice(idx, 1)
    emit('update:modelValue', { selected: current, otherText: '' })
  }
  else {
    current.push(OTHER_KEY)
    emit('update:modelValue', { selected: current, otherText: otherText.value })
  }
}

function handleOtherInput(e: Event) {
  emit('update:modelValue', {
    selected: [...selected.value],
    otherText: (e.target as HTMLInputElement).value,
  })
}

function handleBlur(e: FocusEvent) {
  const container = (e.currentTarget as HTMLElement)
  if (!container.contains(e.relatedTarget as Node)) {
    emit('blur')
  }
}
</script>

<style>
.CheckboxOtherField__other-input {
  margin-top: 0.25rem;
  margin-inline-start: 1.75rem;
  width: calc(100% - 1.75rem);
}
</style>
