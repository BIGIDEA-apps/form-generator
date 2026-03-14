<template>
  <section class="FormPage" :aria-labelledby="showTitle && pageTitle ? 'form-page-title' : undefined">
    <h2 v-if="showTitle && pageTitle" id="form-page-title" class="FormPage__title">{{ pageTitle }}</h2>

    <div class="FormPage__fields">
      <template v-for="field in fields" :key="field.key">
        <div
          v-if="field.inputType === 'display' && isRichTextDisplayField(field.key)"
          :class="['FormPage__display-text', 'FormPage__rich-text', { 'FormPage__display-text--centered': field.key === 'mainDescription' }]"
          v-html="store.formConfig?.fields[field.key]?.defaultValue || field.defaultValue"
        />
        <div v-else-if="field.inputType === 'display'" class="FormPage__display-text">
          {{ store.formConfig?.fields[field.key]?.defaultValue || field.defaultValue }}
        </div>

        <ShortTextField
          v-else-if="field.inputType === 'shortText'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
          @blur="store.validateFieldOnBlur(field.key)"
        />

        <LongTextField
          v-else-if="field.inputType === 'longText'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
          @blur="store.validateFieldOnBlur(field.key)"
        />

        <SelectField
          v-else-if="field.inputType === 'select'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
          @blur="store.validateFieldOnBlur(field.key)"
        />

        <RadioField
          v-else-if="field.inputType === 'radio'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
          @blur="store.validateFieldOnBlur(field.key)"
        />

        <BooleanRadioField
          v-else-if="field.inputType === 'booleanRadio'"
          :field="field"
          :model-value="(store.values[field.key] as string) || ''"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
          @blur="store.validateFieldOnBlur(field.key)"
        />

        <ToggleField
          v-else-if="field.inputType === 'toggle'"
          :field="field"
          :model-value="!!store.values[field.key]"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
          @blur="store.validateFieldOnBlur(field.key)"
        />

        <CheckboxField
          v-else-if="field.inputType === 'checkbox'"
          :field="field"
          :model-value="!!store.values[field.key]"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
          @blur="store.validateFieldOnBlur(field.key)"
        />

        <CheckboxOtherField
          v-else-if="field.inputType === 'checkboxOther'"
          :field="field"
          :model-value="store.values[field.key] as any || { selected: [], otherText: '' }"
          :error="store.errors[field.key]"
          @update:model-value="store.setValue(field.key, $event)"
          @blur="store.validateFieldOnBlur(field.key)"
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
import BooleanRadioField from '~/components/form/fields/BooleanRadioField.vue'
import ToggleField from '~/components/form/fields/ToggleField.vue'
import CheckboxField from '~/components/form/fields/CheckboxField.vue'
import CheckboxOtherField from '~/components/form/fields/CheckboxOtherField.vue'

defineProps<{
  pageTitle: string
  showTitle?: boolean
  fields: FieldConfig[]
}>()

const store = useFormSubmissionStore()

const RICH_TEXT_DISPLAY_FIELDS = ['mainDescription', 'camperDetailsMainText', 'camperDetailsAppendixText', 'page2MainText', 'page3MainText', 'page2AppendixText', 'page3AppendixText']

function isRichTextDisplayField(key: string) {
  return RICH_TEXT_DISPLAY_FIELDS.includes(key)
}

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

.FormPage__display-text {
  color: var(--color-brand-white);
  font-size: 22px;
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

.FormPage__rich-text strong {
  font-weight: 700;
}

.FormPage__rich-text em {
  font-style: italic;
}

.FormPage__rich-text u {
  text-decoration: underline;
}

.FormPage__rich-text s {
  text-decoration: line-through;
}

.FormPage__rich-text ul {
  list-style-type: disc;
  padding-inline-start: 1.5rem;
  margin: 0.25rem 0;
}

.FormPage__rich-text ol {
  list-style-type: decimal;
  padding-inline-start: 1.5rem;
  margin: 0.25rem 0;
}

.FormPage__rich-text li {
  margin-bottom: 0.25rem;
}

.FormPage__rich-text p {
  margin: 0 0 0.5rem;
}

.FormPage__rich-text p:last-child {
  margin-bottom: 0;
}

.FormPage__display-text--centered,
.FormPage__display-text--centered.FormPage__rich-text p {
  text-align: center;
}

@media (max-width: 768px) {
  .FormPage__title { font-size: 26px; margin-bottom: 1rem; }
  .FormPage__display-text { font-size: 18px; margin-bottom: 1rem; }
}

@media (max-width: 480px) {
  .FormPage__title { font-size: 22px; }
  .FormPage__display-text { font-size: 16px; }
}
</style>
