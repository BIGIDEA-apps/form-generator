<template>
  <section class="FormPage">
    <h2 v-if="showTitle && pageTitle" class="FormPage__title">{{ pageTitle }}</h2>

    <p v-if="description" class="FormPage__description" v-html="formattedDescription" />

    <div class="FormPage__fields">
      <template v-for="field in fields" :key="field.key">
        <div v-if="field.inputType === 'display'" class="FormPage__display-text">
          {{ store.formConfig?.fields[field.key]?.defaultValue || field.defaultValue }}
        </div>

        <ShortTextField
          v-else-if="field.inputType === 'shortText'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
        />

        <LongTextField
          v-else-if="field.inputType === 'longText'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
        />

        <SelectField
          v-else-if="field.inputType === 'select'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
        />

        <RadioField
          v-else-if="field.inputType === 'radio'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
        />

        <ToggleField
          v-else-if="field.inputType === 'toggle'"
          :field="field"
          :model-value="!!store.values[field.key]"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
        />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FieldConfig } from '~/types/form'
import { useFormSubmissionStore } from '~/stores/formSubmission'
import ShortTextField from '~/components/form/fields/ShortTextField.vue'
import LongTextField from '~/components/form/fields/LongTextField.vue'
import SelectField from '~/components/form/fields/SelectField.vue'
import RadioField from '~/components/form/fields/RadioField.vue'
import ToggleField from '~/components/form/fields/ToggleField.vue'

defineProps<{
  pageTitle: string
  showTitle?: boolean
  description?: string
  fields: FieldConfig[]
}>()

const store = useFormSubmissionStore()

const formattedDescription = computed(() => {
  const desc = store.formConfig?.mainDescription || ''
  return desc.replace(/\n/g, '<br>')
})
</script>

<style>
.FormPage {
  padding: 0 1rem 1rem;
  max-width: 48rem;
  margin: 0 auto;
}

.FormPage__title {
  color: var(--color-brand-white);
  font-size: 32px;
  font-weight: 700;
  text-align: right;
  margin: 0 0 1.5rem;
}

.FormPage__description {
  color: rgba(255, 255, 255, 0.85);
  font-size: 26px;
  text-align: right;
  line-height: 1.6;
  margin: 0 0 2rem;
}

.FormPage__display-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 26px;
  text-align: right;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  white-space: pre-line;
}

.FormPage__fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
