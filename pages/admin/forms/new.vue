<template>
  <div class="AdminFormNewPage">
    <div class="AdminFormNewPage__layout">
      <div class="AdminFormNewPage__columns">
        <div class="AdminFormNewPage__main">
          <div class="AdminFormNewPage__main-inner">
            <div class="AdminFormNewPage__header">
              <UButton
                icon="i-heroicons-arrow-right"
                variant="ghost"
                color="gray"
                @click="navigateTo('/admin')"
              />
              <h1 class="AdminFormNewPage__title">טופס חדש</h1>
            </div>

            <div class="AdminFormNewPage__content">
              <AdminFormEditor />
            </div>
          </div>
        </div>

        <AdminFieldSettingsSidebar />
      </div>
    </div>

    <footer class="AdminFormNewPage__footer">
      <div class="AdminFormNewPage__footer-inner">
        <UTooltip
          :text="store.hasValidationErrors ? 'חלק מהשדות לא עברו את האימות' : ''"
          :disabled="!store.hasValidationErrors"
        >
          <span class="AdminFormNewPage__save-wrapper">
            <UButton
              icon="i-heroicons-document-arrow-down"
              label="שמור טופס"
              color="primary"
              class="AdminFormNewPage__save-btn"
              :loading="createMutation.isPending.value"
              :disabled="store.hasValidationErrors"
              @click="handleSave"
            />
          </span>
        </UTooltip>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useFormEditorStore } from '~/stores/formEditor'

definePageMeta({
  layout: 'admin',
  colorMode: 'dark',
})

const store = useFormEditorStore()
const createMutation = useCreateFormMutation()
const toast = useToast()

onMounted(() => {
  store.initNew()
})

onUnmounted(() => {
  store.reset()
})

async function handleSave() {
  if (!store.validateAll()) return

  try {
    const data = store.getExportData()
    const result = await createMutation.mutateAsync(data)
    store.clearAllValidationErrors()
    toast.add({ title: 'הטופס נוצר בהצלחה', color: 'green' })
    navigateTo(`/admin/forms/${result._id}`)
  }
  catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || 'שגיאה ביצירת הטופס',
      color: 'red',
    })
  }
}
</script>

<style>
.AdminFormNewPage {
  padding-bottom: 5rem;
}

.AdminFormNewPage__layout {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.AdminFormNewPage__columns {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 74.5rem;
}

.AdminFormNewPage__main {
  flex: 1;
  min-width: 0;
  max-width: 48rem;
}

.AdminFormNewPage__main-inner {
  width: 100%;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
}

.AdminFormNewPage__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.AdminFormNewPage__title {
  font-size: 1.5rem;
  font-weight: 700;
  flex: 1;
}

.AdminFormNewPage__footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 1.5rem;
  background: var(--ui-bg);
  border-top: 1px solid var(--ui-border);
  z-index: 20;
}

.AdminFormNewPage__footer-inner {
  display: flex;
  justify-content: center;
}

.AdminFormNewPage__save-wrapper {
  display: inline-block;
}

.AdminFormNewPage__save-btn {
  min-width: 16rem;
  justify-content: center;
  color: white !important;
}
</style>
