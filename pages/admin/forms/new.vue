<template>
  <div class="AdminFormNewPage">
    <div class="AdminFormNewPage__layout">
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

    <footer class="AdminFormNewPage__footer">
      <div class="AdminFormNewPage__footer-inner">
        <UButton
          icon="i-heroicons-document-arrow-down"
          label="שמור טופס"
          color="primary"
          class="AdminFormNewPage__save-btn"
          :loading="createMutation.isPending.value"
          @click="handleSave"
        />
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
const { notify } = useNotify()

onMounted(() => {
  store.initNew()
})

onUnmounted(() => {
  store.reset()
})

async function handleSave() {
  if (!store.form?.formName) {
    toast.add({ title: 'נא למלא שם פנימי לטופס', color: 'yellow' })
    return
  }

  try {
    const data = store.getExportData()
    const result = await createMutation.mutateAsync(data)
    notify('הטופס נשמר בהצלחה')
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
  margin-left: 22rem;
}

.AdminFormNewPage__main {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.AdminFormNewPage__main-inner {
  max-width: 48rem;
  width: 100%;
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

.AdminFormNewPage__save-btn {
  min-width: 16rem;
  justify-content: center;
  color: white !important;
}
</style>
