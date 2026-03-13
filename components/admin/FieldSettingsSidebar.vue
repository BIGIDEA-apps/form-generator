<template>
  <aside class="FieldSettingsSidebar">
    <div class="FieldSettingsSidebar__panel-title">חלונית הגדרות</div>
    <Transition name="FieldSettingsSidebar__fade">
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

          <UFormGroup v-if="field.inputType === 'display'" label="תוכן">
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
                @update:model-value="updateOption(idx, 'label', $event as string)"
              />
              <UInput
                :model-value="option.value"
                placeholder="ערך"
                size="lg"
                @update:model-value="updateOption(idx, 'value', $event as string)"
              />
              <UButton
                icon="i-heroicons-trash"
                variant="ghost"
                color="red"
                size="sm"
                @click="removeOption(idx)"
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
        </div>
      </div>
    </Transition>
  </aside>
</template>

<script setup lang="ts">
import type { FieldOption } from '~/types/form'
import { useFormEditorStore } from '~/stores/formEditor'

const store = useFormEditorStore()

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
  const newOptions = field.value.options.filter((_, i) => i !== index)
  store.updateFieldConfig(field.value.key, { options: newOptions })
}
</script>

<style>
.FieldSettingsSidebar {
  width: 22rem;
  flex-shrink: 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  position: fixed;
  top: calc(3.5rem + 1.5rem);
  bottom: calc(5rem + 1.5rem);
  left: 1.5rem;
  overflow: hidden;
  z-index: 5;
  display: flex;
  flex-direction: column;
}

.FieldSettingsSidebar__panel-title {
  padding: 1rem 1.25rem;
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
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--ui-border);
  flex-shrink: 0;
}

.FieldSettingsSidebar__title {
  font-size: 1.125rem;
  font-weight: 700;
}

.FieldSettingsSidebar__body {
  padding: 1.25rem;
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

.FieldSettingsSidebar__option-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
