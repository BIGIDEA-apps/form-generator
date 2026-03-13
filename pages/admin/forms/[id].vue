<template>
  <div class="AdminFormEditPage">
    <div v-if="isLoading" class="AdminFormEditPage__centered">
      <div class="AdminFormEditPage__loading">
        <USkeleton class="h-8 w-48" />
        <USkeleton class="h-64 w-full" />
      </div>
    </div>

    <div v-else-if="error" class="AdminFormEditPage__centered">
      <div class="AdminFormEditPage__error">
        <p>שגיאה בטעינת הטופס</p>
        <UButton label="חזרה לרשימה" @click="navigateTo('/admin')" />
      </div>
    </div>

    <template v-else>
      <div class="AdminFormEditPage__layout">
        <div class="AdminFormEditPage__columns">
          <div class="AdminFormEditPage__main">
            <div class="AdminFormEditPage__main-inner">
            <div class="AdminFormEditPage__header">
              <UButton
                icon="i-heroicons-arrow-right"
                variant="ghost"
                color="gray"
                @click="navigateTo('/admin')"
              />
              <h1 class="AdminFormEditPage__title">
                {{ store.form?.formName || 'עריכת טופס' }}
              </h1>
              <div class="AdminFormEditPage__active-toggle">
                <span class="AdminFormEditPage__active-label">{{ store.form?.isActive ? 'טופס אקטיבי' : 'טופס כבוי' }}</span>
                <UToggle
                  :model-value="store.form?.isActive"
                  @update:model-value="store.updateFormField('isActive', $event)"
                />
              </div>
            </div>

            <div class="AdminFormEditPage__content">
              <AdminFormEditor />
            </div>
          </div>
        </div>
          <AdminFieldSettingsSidebar />
        </div>
      </div>

      <footer class="AdminFormEditPage__footer">
        <div class="AdminFormEditPage__footer-inner">
          <div class="AdminFormEditPage__footer-actions">
            <UTooltip
              :text="store.hasValidationErrors ? 'חלק מהשדות לא עברו את האימות' : ''"
              :disabled="!store.hasValidationErrors"
            >
              <span class="AdminFormEditPage__save-wrapper">
                <UButton
                  icon="i-heroicons-document-arrow-down"
                  label="שמור טופס"
                  color="primary"
                  class="AdminFormEditPage__save-btn"
                  :loading="updateMutation.isPending.value"
                  :disabled="!store.isDirty || store.hasValidationErrors"
                  @click="handleSave"
                />
              </span>
            </UTooltip>
            <UButton
              icon="i-heroicons-arrow-top-right-on-square"
              label="לצפייה בטופס"
              variant="outline"
              color="gray"
              :to="formUrl ?? undefined"
              target="_blank"
              :disabled="!formUrl"
            />
            <UButton
              icon="i-heroicons-link"
              label="העתק קישור"
              variant="outline"
              color="gray"
              :disabled="!formUrl"
              @click="handleCopyLink"
            />
          </div>
        </div>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useFormEditorStore } from '~/stores/formEditor'
import { useFormQuery, useUpdateFormMutation } from '~/composables/useFormQueries'

definePageMeta({
  layout: 'admin',
  colorMode: 'dark',
})

const route = useRoute()
const formId = computed(() => route.params.id as string)

const store = useFormEditorStore()
const { formUrl: getFormUrl } = useFormBaseUrl()
const { data: formData, isLoading, error } = useFormQuery(formId)
const updateMutation = useUpdateFormMutation()
const toast = useToast()
const { notify } = useNotify()

const formUrl = computed(() => {
  const slug = store.form?.slug
  return slug ? getFormUrl(slug) : null
})

watch(formData, (data) => {
  if (data) {
    store.loadExisting(data)
  }
}, { immediate: true })

onUnmounted(() => {
  store.reset()
})

async function handleSave() {
  if (!store.validateAll()) return

  try {
    const data = store.getExportData()
    await updateMutation.mutateAsync({ id: formId.value, data })
    store.isDirty = false
    store.clearAllValidationErrors()
    notify('הטופס נשמר בהצלחה')
  }
  catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || 'שגיאה בעדכון הטופס',
      color: 'red',
    })
  }
}

function handleCopyLink() {
  if (!store.form?.slug) return
  const url = getFormUrl(store.form.slug)
  navigator.clipboard.writeText(url)
  notify('הקישור הועתק')
}
</script>

<style>
.AdminFormEditPage {
  padding-bottom: 5rem;
}

.AdminFormEditPage__centered {
  max-width: 48rem;
  margin: 0 auto;
}

.AdminFormEditPage__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.AdminFormEditPage__error {
  text-align: center;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.AdminFormEditPage__layout {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.AdminFormEditPage__columns {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 74.5rem;
}

.AdminFormEditPage__main {
  flex: 1;
  min-width: 0;
  max-width: 48rem;
}

.AdminFormEditPage__main-inner {
  width: 100%;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
}

.AdminFormEditPage__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.AdminFormEditPage__title {
  font-size: 1.5rem;
  font-weight: 700;
  flex: 1;
}

.AdminFormEditPage__active-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-inline-start: auto;
}

.AdminFormEditPage__active-label {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
}

.AdminFormEditPage__footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 1.5rem;
  background: var(--ui-bg);
  border-top: 1px solid var(--ui-border);
  z-index: 20;
}

.AdminFormEditPage__footer-inner {
  display: flex;
  justify-content: center;
}

.AdminFormEditPage__footer-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.AdminFormEditPage__save-wrapper {
  display: inline-block;
}

.AdminFormEditPage__save-btn {
  min-width: 16rem;
  justify-content: center;
  color: white !important;
}
</style>
