<template>
  <section class="PageConfigurator">
    <div class="PageConfigurator__page-header">
      <div class="PageConfigurator__title-row">
        <UFormGroup label="כותרת העמוד">
          <div class="PageConfigurator__title-and-toggle">
            <UInput
              :model-value="page.title"
              dir="rtl"
              size="lg"
              class="PageConfigurator__title-input"
              @update:model-value="emit('updatePageTitle', page.key, $event as string)"
            />
            <div class="PageConfigurator__show-title">
              <span class="PageConfigurator__show-title-label">הצג כותרת בראש העמוד</span>
              <UToggle
                :model-value="page.showTitle !== false"
                @update:model-value="emit('updatePageShowTitle', page.key, $event)"
              />
            </div>
          </div>
        </UFormGroup>
      </div>
    </div>

    <div class="PageConfigurator__fields">
      <AdminFieldPreviewCard
        v-for="field in fields"
        :key="field.key"
        :field="field"
        :is-disabled-by-main-company="isCompanyOverridden && isCompanyFieldOnPage1(field)"
        @update="(key, updates) => emit('updateField', key, updates)"
        @open-settings="store.openFieldSettings"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FieldConfig, FormPage } from '~/types/form'
import { useFormEditorStore } from '~/stores/formEditor'

const props = defineProps<{
  page: FormPage
  fields: FieldConfig[]
}>()

const emit = defineEmits<{
  updatePageTitle: [pageKey: string, title: string]
  updatePageShowTitle: [pageKey: string, showTitle: boolean]
  updateField: [fieldKey: string, updates: Partial<FieldConfig>]
}>()

const store = useFormEditorStore()

const isCompanyOverridden = computed(() => Boolean(store.form?.company?.trim()))

function isCompanyFieldOnPage1(field: FieldConfig) {
  return props.page.key === 'page1' && (field.key === 'companyByUserString' || field.key === 'companyByUserSelect')
}
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
  display: flex;
  flex-direction: column;
}

.PageConfigurator__title-and-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.PageConfigurator__title-input {
  flex: 1;
  min-width: 0;
}

.PageConfigurator__show-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.PageConfigurator__show-title-label {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}

.PageConfigurator__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
