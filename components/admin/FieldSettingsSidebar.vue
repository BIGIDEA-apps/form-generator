<template>
  <aside class="FieldSettingsSidebar">
    <div class="FieldSettingsSidebar__panel-title">חלונית הגדרות</div>
    <Transition name="FieldSettingsSidebar__fade" mode="out-in">
      <div v-if="field" :key="field.key" class="FieldSettingsSidebar__content">
        <div class="FieldSettingsSidebar__header">
          <h3 class="FieldSettingsSidebar__title">{{ field.label }}</h3>
        </div>

        <div class="FieldSettingsSidebar__body">
          <UFormGroup v-if="field.inputType !== 'display'" label="טקסט תצוגה (Label)">
            <UInput
              :model-value="field.presentationLabel"
              dir="rtl"
              size="lg"
              @update:model-value="store.updateFieldConfig(field.key, { presentationLabel: $event })"
            />
          </UFormGroup>

          <UFormGroup v-if="field.inputType === 'display' && isRichTextDisplayField(field.key)" label="תוכן">
            <AdminRichTextEditor
              :model-value="field.defaultValue || ''"
              @update:model-value="store.updateFieldConfig(field.key, { defaultValue: $event })"
            />
          </UFormGroup>

          <UFormGroup v-else-if="field.inputType === 'display'" label="תוכן">
            <UInput
              :model-value="field.defaultValue"
              dir="rtl"
              size="lg"
              @update:model-value="store.updateFieldConfig(field.key, { defaultValue: $event })"
            />
          </UFormGroup>

          <UFormGroup v-if="field.inputType !== 'display'" label="טקסט עזר">
            <UInput
              :model-value="field.infoText"
              dir="rtl"
              size="lg"
              @update:model-value="store.updateFieldConfig(field.key, { infoText: $event })"
            />
          </UFormGroup>

          <UFormGroup v-if="field.inputType !== 'display'" label="Placeholder">
            <UInput
              :model-value="field.placeholder"
              dir="rtl"
              size="lg"
              @update:model-value="store.updateFieldConfig(field.key, { placeholder: $event })"
            />
          </UFormGroup>

          <div
            v-if="field.inputType === 'select' || field.inputType === 'radio'"
            class="FieldSettingsSidebar__options"
          >
            <label class="FieldSettingsSidebar__options-label">אפשרויות</label>
            <p class="FieldSettingsSidebar__options-hint">במידה והערך לשמירה ריק, התווית תשמש כערך שיישמר</p>
            <div v-if="field.options.length" class="FieldSettingsSidebar__option-headers">
              <span class="FieldSettingsSidebar__option-header">תווית לתצוגה</span>
              <span class="FieldSettingsSidebar__option-header">ערך לשמירה</span>
              <span class="FieldSettingsSidebar__option-header-spacer" />
            </div>
            <div
              v-for="(option, idx) in field.options"
              :key="idx"
              class="FieldSettingsSidebar__option-row"
            >
              <UInput
                :model-value="option.label"
                placeholder="תווית"
                dir="rtl"
                size="lg"
                @update:model-value="updateOption(Number(idx), 'label', String($event))"
              />
              <UInput
                :model-value="option.value"
                placeholder="ערך"
                size="lg"
                @update:model-value="updateOption(Number(idx), 'value', String($event))"
              />
              <UButton
                icon="i-heroicons-trash"
                variant="ghost"
                color="red"
                size="sm"
                @click="removeOption(Number(idx))"
              />
            </div>
            <UButton
              icon="i-heroicons-plus"
              label="הוסף אפשרות"
              variant="outline"
              size="sm"
              @click="addOption"
            />
          </div>

          <div v-if="isFallbackField" class="FieldSettingsSidebar__default-session">
            <div
              class="FieldSettingsSidebar__default-session-toggle"
              :class="{ 'FieldSettingsSidebar__default-session-toggle--disabled': field.visible }"
            >
              <span class="FieldSettingsSidebar__options-label">{{ fallbackToggleLabel }}</span>
              <UToggle
                :model-value="isFallbackOn"
                :disabled="field.visible"
                size="sm"
                @update:model-value="toggleFallbackValue"
              />
            </div>
            <p class="FieldSettingsSidebar__options-hint">
              {{ fallbackHelpText }}
            </p>
            <UInput
              v-if="showFallbackInput"
              :model-value="field.fallbackValue || ''"
              dir="rtl"
              size="lg"
              :placeholder="fallbackPlaceholder"
              @update:model-value="store.updateFieldConfig(field.key, { fallbackValue: String($event) })"
            />
          </div>
        </div>
      </div>
    </Transition>
  </aside>
</template>

<script setup lang="ts">
import type { FieldOption, FieldConfig } from '~/types/form'
import { useFormEditorStore } from '~/stores/formEditor'

const store = useFormEditorStore()

const RICH_TEXT_DISPLAY_FIELDS = ['mainDescription', 'page2MainText', 'page3MainText', 'page2AppendixText', 'page3AppendixText']

function isRichTextDisplayField(key: string) {
  return RICH_TEXT_DISPLAY_FIELDS.includes(key)
}

const field = computed(() => store.activeSettingsField)

function updateOption(index: number, key: keyof FieldOption, value: string) {
  if (!field.value) return
  const newOptions = [...field.value.options]
  newOptions[index] = { ...newOptions[index], [key]: value }
  store.updateFieldConfig(field.value.key, { options: newOptions })
}

function addOption() {
  if (!field.value) return
  const newOptions = [...field.value.options, { value: '', label: '' }]
  store.updateFieldConfig(field.value.key, { options: newOptions })
}

function removeOption(index: number) {
  if (!field.value) return
  const newOptions = field.value.options.filter((_: FieldOption, i: number) => i !== index)
  store.updateFieldConfig(field.value.key, { options: newOptions })
}

const FALLBACK_FIELD_KEYS = ['campSession', 'campRound'] as const

const isFallbackField = computed(() => field.value && FALLBACK_FIELD_KEYS.includes(field.value.key as typeof FALLBACK_FIELD_KEYS[number]))

const fallbackToggleLabel = computed(() => {
  if (!field.value) return ''
  return field.value.key === 'campRound' ? 'שליחת סבב דיפולטיבי' : 'שליחת מחזור דיפולטיבי'
})

const fallbackHelpText = computed(() => {
  if (!field.value) return ''
  return field.value.key === 'campRound'
    ? 'במידה והטופס מיועד להרשמה עבור סבב אחד בלבד, ניתן להזין כאן את פרטי הסבב שישלחו לספרדשיט.'
    : 'במידה והטופס מיועד להרשמה עבור מחזור אחד בלבד, ניתן להזין כאן את פרטי המחזור שישלחו לספרדשיט.'
})

const fallbackPlaceholder = computed(() => {
  if (!field.value) return ''
  return field.value.key === 'campRound' ? 'פרטי הסבב' : 'פרטי המחזור'
})

const isFallbackOn = ref(false)

watch(field, (f: FieldConfig | null | undefined) => {
  isFallbackOn.value = Boolean(f && FALLBACK_FIELD_KEYS.includes(f.key as typeof FALLBACK_FIELD_KEYS[number]) && f?.fallbackValue)
}, { immediate: true })

const showFallbackInput = computed(() => {
  if (!field.value || !FALLBACK_FIELD_KEYS.includes(field.value.key as typeof FALLBACK_FIELD_KEYS[number])) return false
  return !field.value.visible && isFallbackOn.value
})

function toggleFallbackValue(on: boolean) {
  if (!field.value) return
  isFallbackOn.value = on
  if (!on) {
    store.updateFieldConfig(field.value.key, { fallbackValue: '' })
  }
}
</script>

<style>
.FieldSettingsSidebar {
  width: 24rem;
  flex-shrink: 0;
  position: sticky;
  top: 5.5rem;
  height: calc(100vh - 5.5rem - 5.5rem);
  min-height: calc(100vh - 5.5rem - 5.5rem);
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  overflow: hidden;
  z-index: 5;
  display: flex;
  flex-direction: column;
}

.FieldSettingsSidebar__panel-title {
  padding-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-bottom: 1px solid var(--ui-border);
  flex-shrink: 0;
}

.FieldSettingsSidebar__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.FieldSettingsSidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  flex-shrink: 0;
}

.FieldSettingsSidebar__title {
  font-size: 1rem;
  font-weight: 600;
}

.FieldSettingsSidebar__body {
  padding-top: 1rem;
  padding-inline-end: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.FieldSettingsSidebar__options {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.FieldSettingsSidebar__options-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.FieldSettingsSidebar__options-hint {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  margin: 0;
  line-height: 1.4;
}

.FieldSettingsSidebar__option-headers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.FieldSettingsSidebar__option-header {
  flex: 1;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ui-text-muted);
}

.FieldSettingsSidebar__option-header-spacer {
  width: 2.25rem;
  flex-shrink: 0;
}

.FieldSettingsSidebar__option-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.FieldSettingsSidebar__option-row > *:first-child,
.FieldSettingsSidebar__option-row > *:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.FieldSettingsSidebar__default-session {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.FieldSettingsSidebar__default-session-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.FieldSettingsSidebar__default-session-toggle--disabled {
  opacity: 0.5;
}

.FieldSettingsSidebar__fade-enter-active,
.FieldSettingsSidebar__fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.FieldSettingsSidebar__fade-enter-from {
  opacity: 0;
  transform: translateX(-1rem);
}

.FieldSettingsSidebar__fade-leave-to {
  opacity: 0;
  transform: translateX(-1rem);
}
</style>
