<template>
  <div class="FormField" :data-field-key="field.key">
    <label :id="`field-${field.key}-label`" class="FormField__label">
      {{ field.presentationLabel }}
      <span v-if="field.required" class="FormField__required" aria-hidden="true">*</span>
      <span v-if="field.required" class="sr-only">שדה חובה</span>
    </label>
    <div
      ref="selectWrapperRef"
      class="FormField__select-wrapper"
      :class="{ 'FormField__select-wrapper--open': isOpen, 'FormField__select-wrapper--error': error }"
    >
      <button
        ref="triggerRef"
        type="button"
        class="FormField__select-trigger"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :aria-controls="`listbox-${field.key}`"
        :aria-labelledby="`field-${field.key}-label`"
        :aria-required="field.required || undefined"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="ariaDescribedby || undefined"
        :aria-activedescendant="isOpen && highlightedIndex >= 0 ? `opt-${field.key}-${highlightedIndex}` : undefined"
        dir="rtl"
        @click="toggleOpen"
        @blur="handleTriggerBlur"
        @keydown="handleKeydown"
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
          aria-hidden="true"
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </button>
      <Teleport to="body">
        <Transition name="FormField__select-drop">
          <div v-if="isOpen" class="FormField__select-backdrop" @click="closeDropdown()" />
        </Transition>
      </Teleport>
      <Transition name="FormField__select-drop">
        <div
          v-if="isOpen"
          :id="`listbox-${field.key}`"
          role="listbox"
          :aria-labelledby="`field-${field.key}-label`"
          class="FormField__select-dropdown"
        >
          <div class="FormField__select-mobile-header">
            <span class="FormField__select-mobile-title">{{ field.presentationLabel }}</span>
            <button type="button" class="FormField__select-mobile-close" aria-label="סגור" @click="closeDropdown()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <div
            v-for="(option, idx) in field.options"
            :id="`opt-${field.key}-${idx}`"
            :key="optionValue(option, idx)"
            role="option"
            :aria-selected="modelValue === optionValue(option, idx)"
            class="FormField__select-option"
            :class="{
              'FormField__select-option--selected': modelValue === optionValue(option, idx),
              'FormField__select-option--highlighted': highlightedIndex === idx,
            }"
            dir="rtl"
            @click="selectOption(optionValue(option, idx))"
            @mouseenter="highlightedIndex = idx"
          >
            {{ option.label || option.value }}
          </div>
        </div>
      </Transition>
    </div>
    <p v-if="field.infoText" :id="`field-${field.key}-info`" class="FormField__info">{{ field.infoText }}</p>
    <p v-if="error" :id="`field-${field.key}-error`" role="alert" class="FormField__error">{{ error }}</p>
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
  blur: []
}>()

const isOpen = ref(false)
const highlightedIndex = ref(-1)
const selectWrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)

function optionValue(option: FieldOption, idx: number) {
  return option.value || option.label || `opt-${idx}`
}

const displayValue = computed(() => {
  if (!props.modelValue) return props.field.placeholder || 'בחרו אפשרות'
  const opt = props.field.options.find((o: FieldOption, i: number) => optionValue(o, i) === props.modelValue)
  return (opt?.label || opt?.value) ?? props.modelValue
})

const ariaDescribedby = computed(() => {
  const ids: string[] = []
  if (props.field.infoText) ids.push(`field-${props.field.key}-info`)
  if (props.error) ids.push(`field-${props.field.key}-error`)
  return ids.join(' ')
})

function openDropdown() {
  if (isOpen.value) return
  isOpen.value = true
  const selectedIdx = props.field.options.findIndex(
    (o: FieldOption, i: number) => optionValue(o, i) === props.modelValue,
  )
  highlightedIndex.value = selectedIdx >= 0 ? selectedIdx : 0
}

function closeDropdown(returnFocus = true) {
  isOpen.value = false
  highlightedIndex.value = -1
  if (returnFocus) {
    nextTick(() => triggerRef.value?.focus())
  }
}

function toggleOpen() {
  if (isOpen.value) {
    closeDropdown()
  }
  else {
    openDropdown()
  }
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  closeDropdown()
  emit('blur')
}

function handleTriggerBlur(e: FocusEvent) {
  const wrapper = selectWrapperRef.value
  if (wrapper && !wrapper.contains(e.relatedTarget as Node)) {
    isOpen.value = false
    highlightedIndex.value = -1
    emit('blur')
  }
}

function handleKeydown(e: KeyboardEvent) {
  const optionsCount = props.field.options.length
  if (!optionsCount) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (!isOpen.value) {
        openDropdown()
      }
      else {
        highlightedIndex.value = (highlightedIndex.value + 1) % optionsCount
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      if (!isOpen.value) {
        openDropdown()
      }
      else {
        highlightedIndex.value = (highlightedIndex.value - 1 + optionsCount) % optionsCount
      }
      break
    case 'Home':
      if (isOpen.value) {
        e.preventDefault()
        highlightedIndex.value = 0
      }
      break
    case 'End':
      if (isOpen.value) {
        e.preventDefault()
        highlightedIndex.value = optionsCount - 1
      }
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (isOpen.value && highlightedIndex.value >= 0) {
        const opt = props.field.options[highlightedIndex.value]
        selectOption(optionValue(opt, highlightedIndex.value))
      }
      else {
        openDropdown()
      }
      break
    case 'Escape':
      if (isOpen.value) {
        e.preventDefault()
        closeDropdown()
      }
      break
    case 'Tab':
      if (isOpen.value) {
        closeDropdown(false)
      }
      break
  }
}

function handleClickOutside(event: MouseEvent) {
  const wrapper = selectWrapperRef.value
  if (wrapper && !wrapper.contains(event.target as Node)) {
    isOpen.value = false
    highlightedIndex.value = -1
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
  max-height: 15rem;
  overflow-y: auto;
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
.FormField__select-option--selected,
.FormField__select-option--highlighted {
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

/* Mobile header and backdrop -- hidden on desktop */

.FormField__select-backdrop {
  display: none;
}

.FormField__select-mobile-header {
  display: none;
}

@media (max-width: 480px) {
  .FormField__select-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.5);
  }

  .FormField__select-wrapper--open .FormField__select-trigger {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

  .FormField__select-dropdown {
    position: fixed;
    inset: 0;
    z-index: 100;
    border-radius: 0;
    max-height: none;
    overflow-y: auto;
    border: none;
    box-shadow: none;
    display: flex;
    flex-direction: column;
  }

  .FormField__select-mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .FormField__select-mobile-title {
    color: var(--color-brand-white);
    font-size: 1.1rem;
    font-weight: 700;
  }

  .FormField__select-mobile-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: rgba(255, 255, 255, 0.7);
    width: 2rem;
    height: 2rem;
  }

  .FormField__select-mobile-close svg {
    width: 100%;
    height: 100%;
  }

  .FormField__select-option {
    padding: 1rem 1.25rem;
    font-size: 1rem;
  }
}
</style>
