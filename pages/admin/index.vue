<template>
  <div class="AdminFormsPage">
    <div class="AdminFormsPage__header">
      <h1 class="AdminFormsPage__title">טפסי הרשמה</h1>
      <div class="AdminFormsPage__header-actions">
        <UButton
          icon="i-heroicons-cog-6-tooth"
          label="הגדרות"
          variant="outline"
          color="gray"
          :to="'/admin/settings'"
        />
        <UButton
          icon="i-heroicons-plus"
          label="טופס חדש"
          color="primary"
          @click="openNewFormModal"
        />
      </div>
    </div>

    <div v-if="!error" class="AdminFormsPage__toolbar">
      <UInput
        v-model="searchInput"
        icon="i-heroicons-magnifying-glass"
        placeholder="חיפוש טפסים..."
        dir="rtl"
        size="sm"
        class="AdminFormsPage__search"
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

    <template v-else-if="forms?.length">
      <AdminFormsList
        :forms="forms"
        @edit="handleEdit"
        @open-form="handleOpenForm"
        @view-submissions="handleViewSubmissions"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @copy-link="handleCopyLink"
      />
      <div class="AdminFormsPage__pagination">
        <UPagination
          v-model="page"
          :total="formsData?.total ?? 0"
          :page-count="15"
          :disabled="(formsData?.total ?? 0) <= 15"
        />
      </div>
    </template>

    <div v-else-if="searchQuery" class="AdminFormsPage__empty AdminFormsPage__empty--search">
      <UIcon name="i-heroicons-magnifying-glass" class="AdminFormsPage__empty-icon" />
      <p>לא נמצאו טפסים התואמים לחיפוש</p>
      <UButton
        label="נקה חיפוש"
        variant="outline"
        @click="clearSearch"
      />
    </div>

    <div v-else class="AdminFormsPage__empty">
      <UIcon name="i-heroicons-document-text" class="AdminFormsPage__empty-icon" />
      <p>אין טפסים עדיין</p>
      <UButton
        label="צרו טופס ראשון"
        color="primary"
        @click="openNewFormModal"
      />
    </div>

    <AdminSpreadsheetSetupModal
      ref="spreadsheetModalRef"
      v-model="showSpreadsheetModal"
      :mode="spreadsheetModalMode"
      :source-spreadsheet="spreadsheetModalSource"
      @confirm="handleSpreadsheetConfirm"
      @cancel="handleSpreadsheetCancel"
    />

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
import type { FormConfig, SpreadsheetInfo } from '~/types/form'
import { getDefaultFormConfig } from '~/utils/fieldDefinitions'

definePageMeta({
  layout: 'admin',
  colorMode: 'dark',
})

const page = ref(1)
const searchInput = ref('')
const searchQuery = ref('')

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (val: string) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchQuery.value = val
    page.value = 1
    searchDebounceTimer = null
  }, 300)
})

const { data: formsData, isLoading, error, refetch } = useFormsListQuery({
  page,
  limit: ref(15),
  search: searchQuery,
})
const forms = computed(() => formsData.value?.items)
const { data: settingsData } = useAppSettingsQuery()

function clearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  page.value = 1
}
const deleteMutation = useDeleteFormMutation()
const duplicateMutation = useDuplicateFormMutation()
const createMutation = useCreateFormMutation()
const { formUrl } = useFormBaseUrl()

const toast = useToast()

const showDeleteModal = ref(false)
const formToDelete = ref<FormConfig | null>(null)

const showSpreadsheetModal = ref(false)
const spreadsheetModalMode = ref<'new' | 'duplicate'>('new')
const spreadsheetModalSource = ref<SpreadsheetInfo | null>(null)
const formToDuplicate = ref<FormConfig | null>(null)
const spreadsheetModalRef = ref<{ resetProcessing: () => void } | null>(null)

function handleEdit(form: FormConfig) {
  navigateTo(`/admin/forms/${form._id}`)
}

function handleOpenForm(form: FormConfig) {
  const url = formUrl(form.slug)
  window.open(url, '_blank')
}

function handleViewSubmissions(form: FormConfig) {
  navigateTo(`/admin/forms/${form._id}/submissions`)
}

function openNewFormModal() {
  spreadsheetModalMode.value = 'new'
  spreadsheetModalSource.value = null
  formToDuplicate.value = null
  showSpreadsheetModal.value = true
}

function handleDuplicate(form: FormConfig) {
  spreadsheetModalMode.value = 'duplicate'
  spreadsheetModalSource.value = form.spreadsheet || null
  formToDuplicate.value = form
  showSpreadsheetModal.value = true
}

async function handleSpreadsheetConfirm(payload: {
  mode: 'existing' | 'generate'
  spreadsheet?: SpreadsheetInfo
  folder?: { id: string; name: string }
  spreadsheetName?: string
}) {
  try {
    let spreadsheet: SpreadsheetInfo | undefined = payload.spreadsheet
    let sourceTemplateId = ''

    if (payload.mode === 'generate' && payload.folder && payload.spreadsheetName) {
      const copyResult = await $fetch<SpreadsheetInfo & { sourceTemplateId?: string }>('/api/spreadsheet/copy-template', {
        method: 'POST',
        body: { folderId: payload.folder.id, spreadsheetName: payload.spreadsheetName },
      })
      sourceTemplateId = copyResult.sourceTemplateId ?? ''
      spreadsheet = { id: copyResult.id, name: copyResult.name, url: copyResult.url, folderId: copyResult.folderId }
    }
    else if (payload.mode === 'existing' && payload.spreadsheet) {
      await $fetch('/api/spreadsheet/share', {
        method: 'POST',
        body: { spreadsheetId: payload.spreadsheet.id },
      })
    }

    if (!spreadsheet) {
      toast.add({ title: 'שגיאה: לא נבחר גיליון אלקטרוני', color: 'red' })
      spreadsheetModalRef.value?.resetProcessing()
      return
    }

    if (spreadsheetModalMode.value === 'duplicate' && formToDuplicate.value?._id) {
      const result = await duplicateMutation.mutateAsync({
        id: formToDuplicate.value._id,
        spreadsheet,
      })
      toast.add({ title: 'הטופס שוכפל בהצלחה', color: 'green' })
      showSpreadsheetModal.value = false
      navigateTo(`/admin/forms/${result._id}`)
    }
    else {
      const defaults = getDefaultFormConfig()
      const settings = settingsData.value
      const result = await createMutation.mutateAsync({
        ...defaults,
        primaryLogo: settings?.defaultPrimaryLogo ?? defaults.primaryLogo,
        primaryLogoSvgToWhite: settings?.defaultPrimaryLogoSvgToWhite ?? defaults.primaryLogoSvgToWhite,
        spreadsheet,
        sourceTemplateId,
      })
      toast.add({ title: 'הטופס נוצר בהצלחה', color: 'green' })
      showSpreadsheetModal.value = false
      navigateTo(`/admin/forms/${result._id}`)
    }
  }
  catch (err: any) {
    toast.add({
      title: err?.data?.statusMessage || 'שגיאה ביצירת הטופס',
      color: 'red',
    })
    spreadsheetModalRef.value?.resetProcessing()
  }
}

function handleSpreadsheetCancel() {
  formToDuplicate.value = null
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
  max-width: var(--admin-content-width);
  margin: 0 auto;
  padding: 1.5rem;
}

.AdminFormsPage__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.AdminFormsPage__header-actions {
  display: flex;
  gap: 0.5rem;
}

.AdminFormsPage__toolbar {
  margin-bottom: 1rem;
}

.AdminFormsPage__search {
  max-width: 20rem;
}

.AdminFormsPage__pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
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

.AdminFormsPage__empty--search .AdminFormsPage__empty-icon {
  font-size: 2.5rem;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.AdminFormsPage__delete-modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>
