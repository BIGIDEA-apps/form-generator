<template>
  <div class="AdminFormsPage">
    <div class="AdminFormsPage__header">
      <h1 class="AdminFormsPage__title">טפסי הרשמה</h1>
      <UButton
        icon="i-heroicons-plus"
        label="טופס חדש"
        color="primary"
        @click="navigateTo('/admin/forms/new')"
      />
    </div>

    <div v-if="isLoading" class="AdminFormsPage__loading">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
    </div>

    <div v-else-if="error" class="AdminFormsPage__error">
      <p>שגיאה בטעינת הטפסים</p>
      <UButton label="נסו שנית" variant="outline" @click="() => refetch()" />
    </div>

    <AdminFormsList
      v-else-if="forms?.length"
      :forms="forms"
      @edit="handleEdit"
      @duplicate="handleDuplicate"
      @delete="handleDelete"
      @copy-link="handleCopyLink"
    />

    <div v-else class="AdminFormsPage__empty">
      <UIcon name="i-heroicons-document-text" class="AdminFormsPage__empty-icon" />
      <p>אין טפסים עדיין</p>
      <UButton
        label="צרו טופס ראשון"
        color="primary"
        @click="navigateTo('/admin/forms/new')"
      />
    </div>

    <UModal v-model="showDeleteModal">
      <div class="AdminFormsPage__delete-modal">
        <h3 class="AdminFormsPage__delete-modal-title">מחיקת טופס</h3>
        <p class="AdminFormsPage__delete-modal-text">
          האם למחוק את "{{ formToDelete?.formName }}"?
        </p>
        <div class="AdminFormsPage__delete-modal-actions">
          <UButton
            label="ביטול"
            variant="outline"
            color="gray"
            @click="showDeleteModal = false"
          />
          <UButton
            label="מחיקה"
            color="red"
            :loading="deleteMutation.isPending.value"
            @click="confirmDelete"
          />
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { FormConfig } from '~/types/form'

definePageMeta({
  layout: 'admin',
  colorMode: 'dark',
})

const { data: formsData, isLoading, error, refetch } = useFormsListQuery()
const forms = computed(() => formsData.value?.items)
const deleteMutation = useDeleteFormMutation()
const duplicateMutation = useDuplicateFormMutation()
const { formUrl } = useFormBaseUrl()

const toast = useToast()
const showDeleteModal = ref(false)
const formToDelete = ref<FormConfig | null>(null)

function handleEdit(form: FormConfig) {
  navigateTo(`/admin/forms/${form._id}`)
}

async function handleDuplicate(form: FormConfig) {
  try {
    await duplicateMutation.mutateAsync(form._id!)
    toast.add({ title: 'הטופס שוכפל בהצלחה', color: 'green' })
  }
  catch {
    toast.add({ title: 'שגיאה בשכפול הטופס', color: 'red' })
  }
}

function handleDelete(form: FormConfig) {
  formToDelete.value = form
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!formToDelete.value) return

  try {
    await deleteMutation.mutateAsync(formToDelete.value._id!)
    toast.add({ title: 'הטופס נמחק', color: 'green' })
  }
  catch {
    toast.add({ title: 'שגיאה במחיקת הטופס', color: 'red' })
  }
  finally {
    showDeleteModal.value = false
    formToDelete.value = null
  }
}

function handleCopyLink(form: FormConfig) {
  const url = formUrl(form.slug)
  navigator.clipboard.writeText(url)
  toast.add({ title: 'הקישור הועתק', color: 'green' })
}
</script>

<style>
.AdminFormsPage {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.AdminFormsPage__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.AdminFormsPage__title {
  font-size: 1.5rem;
  font-weight: 700;
}

.AdminFormsPage__loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.AdminFormsPage__error {
  text-align: center;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.AdminFormsPage__empty {
  text-align: center;
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--ui-text-muted);
}

.AdminFormsPage__empty-icon {
  font-size: 3rem;
}

.AdminFormsPage__delete-modal {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.AdminFormsPage__delete-modal-title {
  font-size: 1.125rem;
  font-weight: 700;
}

.AdminFormsPage__delete-modal-text {
  color: var(--ui-text-muted);
  font-size: 0.9375rem;
}

.AdminFormsPage__delete-modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>
