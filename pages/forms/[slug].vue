<template>
  <main class="PublicFormPage">
    <div v-if="isLoading" class="PublicFormPage__loading">
      <div class="PublicFormPage__loading-spinner" />
    </div>

    <div v-else-if="error || !formConfig" class="PublicFormPage__error">
      <img src="/img/logos/bigidea-logo.png" alt="BIGIDEA" class="PublicFormPage__error-logo">
      <h1>הטופס לא נמצא</h1>
      <p>ייתכן שהקישור שגוי או שהטופס אינו פעיל</p>
    </div>

    <template v-else-if="store.submitted">
      <div class="PublicFormPage__success">
        <FormHeader
          :primary-logo="formConfig.primaryLogo"
          :primary-logo-svg-to-white="formConfig.primaryLogoSvgToWhite"
          :secondary-logo="formConfig.secondaryLogo"
          :secondary-logo-svg-to-white="formConfig.secondaryLogoSvgToWhite"
          :title="formConfig.formTitle"
        />
        <div class="PublicFormPage__success-content">
          <svg class="PublicFormPage__success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <h2>הטופס נשלח בהצלחה!</h2>
          <p>תודה על ההרשמה. נחזור אליכם בהקדם.</p>
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
        :page-title="currentPageTitle"
        :show-title="store.currentPage?.showTitle !== false"
        :description="store.currentPageIndex === 0 ? formConfig.mainDescription : undefined"
        :fields="store.currentPageFields"
      />

      <FormNavigation
        :is-first="store.isFirstPage"
        :is-last="store.isLastPage"
        :loading="store.submitting"
        @prev="store.prevPage()"
        @next="store.nextPage()"
        @submit="handleSubmit"
      />
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

async function handleSubmit() {
  if (!store.validateCurrentPage()) return
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
    console.error('Submission error:', err)
    alert('אירעה שגיאה בשליחת הטופס. אנא נסו שנית.')
  }
  finally {
    store.submitting = false
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
}

.PublicFormPage__success-content {
  text-align: center;
  padding: 3rem 1rem;
  color: white;
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
}

/* ─── Form field shared styles ─── */

.FormField {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: right;
}

.FormField__label {
  color: var(--color-brand-white);
  font-size: 26px;
  font-weight: 700;
}

.FormField__required {
  color: var(--color-brand-primary);
}

.FormField__info {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin: 0;
}

.FormField__input,
.FormField__textarea,
.FormField__select {
  width: 100%;
  background: var(--color-brand-input-bg);
  color: var(--color-brand-white);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 22px;
  font-family: inherit;
  transition: border-color 0.2s;
  outline: none;
}

.FormField__input:focus,
.FormField__textarea:focus,
.FormField__select:focus {
  border-color: var(--color-brand-primary);
}

.FormField__input--error,
.FormField__textarea--error,
.FormField__select--error {
  border-color: #ef4444;
}

.FormField__input::placeholder,
.FormField__textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.FormField__textarea {
  resize: vertical;
  min-height: 6rem;
}

.FormField__select-wrapper {
  position: relative;
}

.FormField__select {
  appearance: none;
  cursor: pointer;
  padding-left: 2.5rem;
}

.FormField__select option {
  background: var(--color-brand-input-bg);
  color: white;
}

.FormField__select-chevron {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.FormField__error {
  color: #fca5a5;
  font-size: 16px;
  margin: 0;
}

/* ─── Radio field styles ─── */

.FormField__radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.FormField__radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--color-brand-white);
  font-size: 22px;
}

.FormField__radio-input {
  display: none;
}

.FormField__radio-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.FormField__radio-input:checked + .FormField__radio-custom {
  border-color: var(--color-brand-primary);
}

.FormField__radio-input:checked + .FormField__radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-brand-primary);
  border-radius: 50%;
}

/* ─── Toggle field styles ─── */

.FormField__toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.FormField__toggle-track {
  display: block;
  width: 3rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  position: relative;
  transition: background 0.2s;
}

.FormField__toggle--active .FormField__toggle-track {
  background: var(--color-brand-primary);
}

.FormField__toggle-thumb {
  position: absolute;
  top: 0.15rem;
  right: 0.15rem;
  width: 1.2rem;
  height: 1.2rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.FormField__toggle--active .FormField__toggle-thumb {
  transform: translateX(-1.5rem);
}
</style>
