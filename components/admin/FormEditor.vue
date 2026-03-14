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
              @blur="store.validateField('formName')"
            />
            <p v-if="store.validationErrors.formName" class="FormEditor__field-error">{{ store.validationErrors.formName }}</p>
          </UFormGroup>
          <UFormGroup label="חברה">
            <UInput
              :model-value="store.form?.company"
              dir="rtl"
              size="lg"
              @update:model-value="store.updateFormField('company', $event)"
            />
            <p class="FormEditor__field-hint">במידה ומדובר בטופס כללי, יש להשאיר שדה זה ריק</p>
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
                @blur="store.validateField('slug')"
              />
            </div>
            <p v-if="store.validationErrors.slug" class="FormEditor__field-error">{{ store.validationErrors.slug }}</p>
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
              @blur="store.validateField('formTitle')"
            />
            <p v-if="store.validationErrors.formTitle" class="FormEditor__field-error">{{ store.validationErrors.formTitle }}</p>
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

    <section ref="pagesSectionRef" class="FormEditor__subsection FormEditor__pages">
      <h3 class="FormEditor__section-title">עמודי הטופס</h3>

      <UTabs
        :model-value="currentPageIndex"
        :items="pageTabs"
        value-key="value"
        color="primary"
        class="FormEditor__tabs"
        :ui="{
          list: {
            marker: { background: '!bg-[#00CDFF]' },
            tab: { active: '!text-white' },
          },
        }"
        @update:model-value="handleTabChangeByIndex"
      >
        <template #item="{ item }">
          <div class="FormEditor__page-wrapper">
            <AdminPageConfigurator
              v-if="getPage(item.key)"
              :page="getPageSafe(item.key)"
              :fields="getPageFields(item.key)"
              @update-page-title="store.updatePageTitle"
              @update-page-show-title="store.updatePageShowTitle"
              @update-field="store.updateFieldConfig"
            />
            <div class="FormEditor__page-nav">
              <UButton
                label="עמוד קודם"
                icon="i-heroicons-arrow-right"
                variant="outline"
                color="gray"
                :disabled="isFirstPage"
                @click="goToPrevPage"
              />
              <UButton
                label="עמוד הבא"
                icon="i-heroicons-arrow-left"
                icon-position="right"
                variant="outline"
                color="gray"
                :disabled="isLastPage"
                @click="goToNextPage"
              />
            </div>
          </div>
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
  (store.form?.pages || []).map((page: FormPage, idx: number) => ({
    label: page.title || `עמוד ${idx + 1}`,
    key: page.key,
    value: idx,
  })),
)

const currentPageIndex = computed(() => {
  const pages = store.form?.pages || []
  const idx = pages.findIndex((p: FormPage) => p.key === store.activePageKey)
  return idx >= 0 ? idx : 0
})

const isFirstPage = computed(() => currentPageIndex.value <= 0)

const isLastPage = computed(() => {
  const pages = store.form?.pages || []
  return pages.length <= 0 || currentPageIndex.value >= pages.length - 1
})

const pagesSectionRef = ref<HTMLElement | null>(null)

function scrollToPagesNav() {
  pagesSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleTabChangeByIndex(index: string | number) {
  const idx = typeof index === 'string' ? parseInt(index, 10) : index
  const pages = store.form?.pages || []
  const page = pages[idx]
  if (page) store.setActivePage(page.key)
}

function goToPrevPage() {
  if (isFirstPage.value) return
  const pages = store.form?.pages || []
  const idx = currentPageIndex.value - 1
  if (pages[idx]) {
    store.setActivePage(pages[idx].key)
    nextTick(() => scrollToPagesNav())
  }
}

function goToNextPage() {
  if (isLastPage.value) return
  const pages = store.form?.pages || []
  const idx = currentPageIndex.value + 1
  if (pages[idx]) {
    store.setActivePage(pages[idx].key)
    nextTick(() => scrollToPagesNav())
  }
}

function getPage(pageKey: string): FormPage | undefined {
  return store.form?.pages.find((p: FormPage) => p.key === pageKey)
}

function getPageSafe(pageKey: string): FormPage {
  const page = getPage(pageKey)
  if (!page) throw new Error(`Page ${pageKey} not found`)
  return page
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

.FormEditor__field-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

.FormEditor__field-hint {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  margin: 0.25rem 0 0;
  line-height: 1.4;
}

.FormEditor__page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.FormEditor__page-nav {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--ui-border);
}
</style>
