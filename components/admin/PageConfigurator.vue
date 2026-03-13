<template>
  <section class="PageConfigurator">
    <div class="PageConfigurator__page-header">
      <div class="PageConfigurator__title-row">
        <UFormGroup label="כותרת העמוד">
          <UInput
            :model-value="page.title"
            dir="rtl"
            size="lg"
            @update:model-value="emit('updatePageTitle', page.key, $event as string)"
          />
        </UFormGroup>
        <UFormGroup label="הצגת כותרת">
          <UToggle
            :model-value="page.showTitle !== false"
            @update:model-value="emit('updatePageShowTitle', page.key, $event)"
          />
        </UFormGroup>
      </div>
    </div>

    <div class="PageConfigurator__fields">
      <AdminFieldPreviewCard
        v-for="field in fields"
        :key="field.key"
        :field="field"
        @update="(key, updates) => emit('updateField', key, updates)"
        @open-settings="store.openFieldSettings"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FieldConfig, FormPage } from '~/types/form'
import { useFormEditorStore } from '~/stores/formEditor'

defineProps<{
  page: FormPage
  fields: FieldConfig[]
}>()

const emit = defineEmits<{
  updatePageTitle: [pageKey: string, title: string]
  updatePageShowTitle: [pageKey: string, showTitle: boolean]
  updateField: [fieldKey: string, updates: Partial<FieldConfig>]
}>()

const store = useFormEditorStore()
</script>

<style>
.PageConfigurator {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
}

.PageConfigurator__page-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--ui-border);
}

.PageConfigurator__title-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: flex-end;
}

.PageConfigurator__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
