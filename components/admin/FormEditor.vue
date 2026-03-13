<template>
  <div class="FormEditor">
    <section class="FormEditor__general">
      <div class="FormEditor__subsection FormEditor__form-settings">
        <h3 class="FormEditor__subsection-title">הגדרות טופס</h3>
        <div class="FormEditor__form-settings-fields">
          <UFormGroup label="שם פנימי" required>
            <UInput
              :model-value="store.form?.formName"
              dir="rtl"
              size="lg"
              @update:model-value="store.updateFormField('formName', $event)"
            />
          </UFormGroup>
          <UFormGroup label="חברה">
            <UInput
              :model-value="store.form?.company"
              dir="rtl"
              size="lg"
              @update:model-value="store.updateFormField('company', $event)"
            />
          </UFormGroup>
          <UFormGroup label="Slug (כתובת URL)">
            <div class="FormEditor__slug-row" dir="ltr">
              <span class="FormEditor__slug-prefix">{{ slugPrefix }}</span>
              <UInput
                :model-value="store.form?.slug"
                dir="ltr"
                size="lg"
                placeholder="auto-generated-if-empty"
                class="FormEditor__slug-input"
                @update:model-value="store.updateFormField('slug', $event)"
              />
            </div>
          </UFormGroup>
        </div>
      </div>

      <hr class="FormEditor__divider" />

      <div class="FormEditor__subsection FormEditor__form-header">
        <h3 class="FormEditor__subsection-title">כותרת הטופס</h3>
        <div class="FormEditor__form-header-fields">
          <UFormGroup label="שם הטופס (לתצוגה)" required>
            <UInput
              :model-value="store.form?.formTitle"
              dir="rtl"
              size="lg"
              @update:model-value="store.updateFormField('formTitle', $event)"
            />
          </UFormGroup>
        </div>
        <div class="FormEditor__logos">
          <AdminLogoUploader
            :model-value="store.form?.primaryLogo ?? null"
            label="לוגו ראשי"
            :is-required="true"
            :svg-to-white="store.form?.primaryLogoSvgToWhite ?? false"
            @update:model-value="store.updateFormField('primaryLogo', $event || '/img/logos/bigidea-logo.png')"
            @update:svg-to-white="store.updateFormField('primaryLogoSvgToWhite', $event)"
          />
          <AdminLogoUploader
            :model-value="store.form?.secondaryLogo ?? null"
            label="לוגו חברה"
            :svg-to-white="store.form?.secondaryLogoSvgToWhite ?? false"
            @update:model-value="store.updateFormField('secondaryLogo', $event)"
            @update:svg-to-white="store.updateFormField('secondaryLogoSvgToWhite', $event)"
          />
        </div>
      </div>
    </section>

    <hr class="FormEditor__divider" />

    <section class="FormEditor__subsection FormEditor__pages">
      <h3 class="FormEditor__section-title">עמודי הטופס</h3>

      <UTabs :items="pageTabs" @change="handleTabChange">
        <template #item="{ item }">
          <AdminPageConfigurator
            v-if="getPage(item.key)"
            :page="getPage(item.key)!"
            :fields="getPageFields(item.key)"
            @update-page-title="store.updatePageTitle"
            @update-page-show-title="store.updatePageShowTitle"
            @update-field="store.updateFieldConfig"
          />
        </template>
      </UTabs>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FieldConfig, FormPage } from '~/types/form'
import { useFormEditorStore } from '~/stores/formEditor'

const store = useFormEditorStore()
const { formBaseUrl } = useFormBaseUrl()

const slugPrefix = computed(() => (formBaseUrl ? `${formBaseUrl}/forms/` : '/forms/'))

const pageTabs = computed(() =>
  (store.form?.pages || []).map((page, idx) => ({
    label: page.title || `עמוד ${idx + 1}`,
    key: page.key,
  })),
)

function handleTabChange(index: number) {
  const pages = store.form?.pages || []
  if (pages[index]) {
    store.setActivePage(pages[index].key)
  }
}

function getPage(pageKey: string): FormPage | undefined {
  return store.form?.pages.find(p => p.key === pageKey)
}

function getPageFields(pageKey: string): FieldConfig[] {
  const page = getPage(pageKey)
  if (!page || !store.form) return []
  return page.fields
    .map(key => store.form!.fields[key])
    .filter(Boolean)
}
</script>

<style>
.FormEditor {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.FormEditor__section-title,
.FormEditor__subsection-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.FormEditor__subsection {
  padding-top: 1.5rem;
}

.FormEditor__subsection:first-child {
  padding-top: 0;
}

.FormEditor__subsection-title {
  margin-bottom: 0.75rem;
}

.FormEditor__divider {
  margin: 1.25rem 0;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.FormEditor__form-settings,
.FormEditor__form-header {
  max-width: 28rem;
}

.FormEditor__form-settings-fields,
.FormEditor__form-header-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.FormEditor__form-header .FormEditor__subsection-title {
  margin-bottom: 0.75rem;
}

.FormEditor__form-header .FormEditor__logos {
  margin-top: 1rem;
}

.FormEditor__logos {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.FormEditor__slug-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.FormEditor__slug-prefix {
  color: var(--ui-text-muted);
  font-size: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

.FormEditor__slug-row .FormEditor__slug-input {
  flex: 1;
  min-width: 0;
}

.FormEditor__slug-row .FormEditor__slug-input input {
  padding-inline-start: 0.5rem;
}
</style>
