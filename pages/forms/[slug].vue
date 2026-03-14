<template>
  <main class="PublicFormPage" lang="he" dir="rtl">
    <div v-if="isLoading" class="PublicFormPage__loading" role="status" aria-label="טוען...">
      <div class="PublicFormPage__loading-spinner" aria-hidden="true" />
      <span class="sr-only">טוען טופס...</span>
    </div>

    <div v-else-if="error || !formConfig" class="PublicFormPage__error" role="alert">
      <img src="/img/logos/bigidea-logo.svg" alt="BIGIDEA" class="PublicFormPage__error-logo">
      <h1>הטופס לא נמצא</h1>
      <p>ייתכן שהקישור שגוי או שהטופס אינו פעיל</p>
    </div>

    <template v-else-if="store.submitted">
      <div class="PublicFormPage__success" role="status" aria-live="polite">
        <FormHeader
          :primary-logo="formConfig.primaryLogo"
          :primary-logo-svg-to-white="formConfig.primaryLogoSvgToWhite"
          :secondary-logo="formConfig.secondaryLogo"
          :secondary-logo-svg-to-white="formConfig.secondaryLogoSvgToWhite"
          :title="formConfig.formTitle"
        />
        <div class="PublicFormPage__success-content">
          <svg class="PublicFormPage__success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <h2>{{ successTitle }}</h2>
          <div
            v-if="successMessageHtml"
            class="PublicFormPage__success-message PublicFormPage__success-message--rich"
            v-html="successMessageHtml"
          />
          <p v-else>{{ successMessagePlain }}</p>
          <button
            type="button"
            class="PublicFormPage__success-btn"
            @click="handleSubmitAnother"
          >
            הרשמה נוספת
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <FormHeader
        :primary-logo="formConfig.primaryLogo"
        :primary-logo-svg-to-white="formConfig.primaryLogoSvgToWhite"
        :secondary-logo="formConfig.secondaryLogo"
        :secondary-logo-svg-to-white="formConfig.secondaryLogoSvgToWhite"
        :title="formConfig.formTitle"
      />

      <FormPage
        ref="formPageRef"
        :page-title="currentPageTitle"
        :show-title="store.currentPage?.showTitle !== false"
        :fields="store.currentPageFields"
      />

      <FormNavigation
        :is-first="store.isFirstPage"
        :is-last="store.isLastPage"
        :loading="store.submitting"
        @prev="handlePrev"
        @next="handleNext"
        @submit="handleSubmit"
      />

      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ pageAnnouncement }}
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { useFormSubmissionStore } from '~/stores/formSubmission'
import FormHeader from '~/components/form/FormHeader.vue'
import FormPage from '~/components/form/FormPage.vue'
import FormNavigation from '~/components/form/FormNavigation.vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: formConfig, isLoading, error } = usePublicFormQuery(slug)
const store = useFormSubmissionStore()
const formPageRef = ref<InstanceType<typeof FormPage> | null>(null)
const pageAnnouncement = ref('')

const pageTitle = computed(() => formConfig.value?.formTitle || 'טופס')
useHead({
  title: pageTitle,
})

watch(formConfig, (config) => {
  if (config) {
    store.init(config)
  }
}, { immediate: true })

const currentPageTitle = computed(() => {
  const page = store.currentPage
  if (!page) return ''
  return page.title || ''
})

const successTitle = computed(() =>
  formConfig.value?.successTitle?.trim() || 'הטופס נשלח בהצלחה!',
)

const successMessageHtml = computed(() => {
  const msg = formConfig.value?.successMessage?.trim()
  return msg || ''
})

const successMessagePlain = computed(() => 'תודה על ההרשמה. נחזור אליכם בהקדם.')

function focusPageTop() {
  nextTick(() => {
    const pageEl = formPageRef.value?.$el as HTMLElement | undefined
    if (!pageEl) return
    const heading = pageEl.querySelector('h2')
    const firstInput = pageEl.querySelector('input, textarea, select, button, [tabindex]') as HTMLElement | null
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus()
    }
    else if (firstInput) {
      firstInput.focus()
    }
  })
}

function announcePageChange() {
  pageAnnouncement.value = ''
  nextTick(() => {
    pageAnnouncement.value = `עמוד ${store.currentPageIndex + 1} מתוך ${store.totalPages}`
  })
}

function scrollToFirstInvalidField() {
  nextTick(() => {
    const firstErrorKey = store.currentPageFields.find(f => store.errors[f.key])?.key
    if (firstErrorKey) {
      const fieldEl = document.querySelector(`[data-field-key="${firstErrorKey}"]`)
      fieldEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      nextTick(() => {
        const focusable = fieldEl?.querySelector('input, textarea, select, button, [tabindex]') as HTMLElement | null
        focusable?.focus()
      })
    }
  })
}

function handlePrev() {
  store.prevPage()
  announcePageChange()
  focusPageTop()
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

function handleNext() {
  const ok = store.nextPage()
  if (!ok) {
    scrollToFirstInvalidField()
  }
  else {
    announcePageChange()
    focusPageTop()
    nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }
}

async function handleSubmit() {
  if (!store.validateCurrentPage()) {
    scrollToFirstInvalidField()
    return
  }
  if (!formConfig.value) return

  store.submitting = true

  try {
    await $fetch('/api/submissions', {
      method: 'POST',
      body: {
        formId: formConfig.value._id,
        formSlug: formConfig.value.slug,
        data: store.getSubmissionData(),
      },
    })
    store.submitted = true
  }
  catch (err) {
    // Debug log: Submission error
    if (import.meta.dev) console.error('Submission error:', err)
    alert('אירעה שגיאה בשליחת הטופס. אנא נסו שנית.')
  }
  finally {
    store.submitting = false
  }
}

function handleSubmitAnother() {
  if (formConfig.value) {
    store.init(formConfig.value)
    nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }
}

onUnmounted(() => {
  store.reset()
})
</script>

<style>
.PublicFormPage {
  min-height: 100vh;
  background: var(--color-brand-bg);
  direction: rtl;
  font-family: 'almoni-dl-aaa', sans-serif;
}

.PublicFormPage__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.PublicFormPage__loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--color-brand-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.PublicFormPage__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
  color: white;
}

.PublicFormPage__error-logo {
  width: 8rem;
  margin-bottom: 2rem;
}

.PublicFormPage__error h1 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.PublicFormPage__error p {
  opacity: 0.7;
  font-size: 0.95rem;
}

.PublicFormPage__success {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.PublicFormPage__success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1rem;
  color: white;
  width: 100%;
  max-width: 32rem;
}

.PublicFormPage__success-icon {
  width: 4rem;
  height: 4rem;
  color: var(--color-brand-primary);
  margin-bottom: 1.5rem;
}

.PublicFormPage__success-content h2 {
  font-size: 1.5rem;
  margin: 0 0 0.75rem;
}

.PublicFormPage__success-content p {
  opacity: 0.8;
  font-size: 1rem;
  margin: 0 0 1.5rem;
}

.PublicFormPage__success-message {
  opacity: 0.8;
  font-size: 1rem;
  margin: 0 0 1.5rem;
}

.PublicFormPage__success-message--rich p {
  margin: 0 0 0.5rem;
}

.PublicFormPage__success-message--rich p:last-child {
  margin-bottom: 0;
}

.PublicFormPage__success-message--rich ul,
.PublicFormPage__success-message--rich ol {
  padding-inline-start: 1.5rem;
  margin: 0.25rem 0;
}

.PublicFormPage__success-message--rich ul {
  list-style-type: disc;
}

.PublicFormPage__success-message--rich ol {
  list-style-type: decimal;
}

.PublicFormPage__success-btn {
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--color-brand-primary);
  background: var(--color-brand-primary);
  color: var(--color-brand-white);
  font-family: inherit;
}

.PublicFormPage__success-btn:hover {
  background: var(--color-brand-white);
  color: var(--color-brand-primary);
}

/* Public form size overrides (shared base in form-fields.css) */

.PublicFormPage .FormField__label {
  font-size: 26px;
}

.PublicFormPage .FormField__info {
  font-size: 16px;
}

.PublicFormPage .FormField__input,
.PublicFormPage .FormField__textarea,
.PublicFormPage .FormField__select-trigger {
  font-size: 22px;
}

.PublicFormPage .FormField__error {
  font-size: 16px;
}

.PublicFormPage .FormField__radio-option,
.PublicFormPage .FormField__checkbox-option {
  font-size: 22px;
}

@media (max-width: 768px) {
  .PublicFormPage .FormField__label { font-size: 22px; }
  .PublicFormPage .FormField__input,
  .PublicFormPage .FormField__textarea,
  .PublicFormPage .FormField__select-trigger { font-size: 18px; }
  .PublicFormPage .FormField__radio-option,
  .PublicFormPage .FormField__checkbox-option { font-size: 18px; }
  .PublicFormPage .FormField__info,
  .PublicFormPage .FormField__error { font-size: 14px; }
}

@media (max-width: 480px) {
  .PublicFormPage .FormField__label { font-size: 20px; }
  .PublicFormPage .FormField__input,
  .PublicFormPage .FormField__textarea,
  .PublicFormPage .FormField__select-trigger { font-size: 16px; }
  .PublicFormPage .FormField__radio-option,
  .PublicFormPage .FormField__checkbox-option { font-size: 16px; }
}
</style>
