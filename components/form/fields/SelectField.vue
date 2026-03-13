<template>
  <div class="FormField">
    <label class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required">*</span>
    </label>
    <div
      ref="selectWrapperRef"
      class="FormField__select-wrapper"
      :class="{ 'FormField__select-wrapper--open': isOpen, 'FormField__select-wrapper--error': error }"
    >
      <button
        type="button"
        class="FormField__select-trigger"
        dir="rtl"
        @click="toggleOpen"
      >
        <span
          class="FormField__select-value"
          :class="{ 'FormField__select-value--placeholder': !modelValue }"
        >
          {{ displayValue }}
        </span>
        <svg
          class="FormField__select-chevron"
          :class="{ 'FormField__select-chevron--open': isOpen }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </button>
      <Transition name="FormField__select-drop">
        <div v-if="isOpen" class="FormField__select-dropdown">
          <button
            v-for="(option, idx) in field.options"
            :key="optionValue(option, idx)"
            type="button"
            class="FormField__select-option"
            :class="{ 'FormField__select-option--selected': modelValue === optionValue(option, idx) }"
            dir="rtl"
            @click="selectOption(optionValue(option, idx))"
          >
            {{ option.label || option.value }}
          </button>
        </div>
      </Transition>
    </div>
    <p v-if="field.infoText" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" class="FormField__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig, FieldOption } from '~/types/form'

const props = defineProps<{
  field: FieldConfig
  modelValue: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectWrapperRef = ref<HTMLElement | null>(null)

function optionValue(option: FieldOption, idx: number) {
  return option.value || option.label || `opt-${idx}`
}

const displayValue = computed(() => {
  if (!props.modelValue) return props.field.placeholder || 'בחרו אפשרות'
  const opt = props.field.options.find((o: FieldOption, i: number) => optionValue(o, i) === props.modelValue)
  return (opt?.label || opt?.value) ?? props.modelValue
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const wrapper = selectWrapperRef.value
  if (wrapper && !wrapper.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
.FormField__select-wrapper {
  position: relative;
}

.FormField__select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: var(--color-brand-input-bg);
  color: var(--color-brand-white);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  padding-left: 2.5rem;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  text-align: right;
  outline: none;
  transition: border-color 0.2s;
}

.FormField__select-trigger:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.FormField__select-wrapper--open .FormField__select-trigger {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-color: var(--color-brand-primary);
}

.FormField__select-wrapper--error .FormField__select-trigger {
  border-color: #ef4444;
}

.FormField__select-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.FormField__select-value--placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.FormField__select-chevron {
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  transition: transform 0.2s;
}

.FormField__select-chevron--open {
  transform: rotate(180deg);
}

.FormField__select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: var(--color-brand-input-bg);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.FormField__select-option {
  width: 100%;
  display: block;
  padding: 0.75rem 1rem;
  background: transparent;
  color: var(--color-brand-white);
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  font-family: inherit;
  font-size: inherit;
  text-align: right;
  cursor: pointer;
  transition: background 0.15s;
}

.FormField__select-option:first-child {
  border-top: none;
}

.FormField__select-option:hover,
.FormField__select-option--selected {
  background: var(--color-brand-select-hover);
}

.FormField__select-drop-enter-active,
.FormField__select-drop-leave-active {
  transition: opacity 0.15s ease;
}

.FormField__select-drop-enter-from,
.FormField__select-drop-leave-to {
  opacity: 0;
}
</style>
