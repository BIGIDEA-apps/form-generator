<template>
  <div class="AdminSettingsPage" dir="rtl">
    <div class="AdminSettingsPage__header">
      <UButton
        icon="i-heroicons-arrow-right"
        variant="ghost"
        color="gray"
        @click="navigateTo('/admin')"
      />
      <h1 class="AdminSettingsPage__title">הגדרות כלליות</h1>
    </div>

    <div v-if="isLoading" class="AdminSettingsPage__loading">
      <USkeleton class="h-48 w-full" />
      <USkeleton class="h-32 w-full" />
    </div>

    <template v-else-if="settings">
      <section class="AdminSettingsPage__section">
        <h2 class="AdminSettingsPage__section-title">לוגו ברירת מחדל</h2>
        <p class="AdminSettingsPage__section-desc">
          הלוגו שיוצג כברירת מחדל בטפסים חדשים
        </p>
        <AdminLogoUploader
          :model-value="settings.defaultPrimaryLogo || null"
          label="לוגו"
          :is-required="false"
          :svg-to-white="settings.defaultPrimaryLogoSvgToWhite"
          @update:model-value="handleLogoUpdate($event)"
          @update:svg-to-white="handleLogoSvgUpdate($event)"
        />
      </section>

      <section class="AdminSettingsPage__section">
        <h2 class="AdminSettingsPage__section-title">תבנית גיליון אלקטרוני</h2>
        <p class="AdminSettingsPage__section-desc">
          התבנית שממנה יועתקו גיליונות חדשים בעת יצירת טופס
        </p>
        <div class="AdminSettingsPage__template">
          <div v-if="settings.spreadsheetTemplateName" class="AdminSettingsPage__template-chip">
            <UIcon name="i-heroicons-table-cells" class="AdminSettingsPage__template-icon" />
            <span class="AdminSettingsPage__template-name">{{ settings.spreadsheetTemplateName }}</span>
          </div>
          <p v-else class="AdminSettingsPage__template-empty">לא הוגדר</p>
          <div class="AdminSettingsPage__template-actions">
            <UButton
              v-if="settings.spreadsheetTemplateUrl"
              label="פתח תבנית"
              icon="i-heroicons-arrow-top-right-on-square"
              variant="outline"
              color="gray"
              size="sm"
              :disabled="updateMutation.isPending.value"
              @click="openTemplate"
            />
            <UButton
              label="בחר תבנית חדשה"
              icon="i-heroicons-table-cells"
              variant="outline"
              color="gray"
              size="sm"
              :loading="picker.isLoading.value"
              :disabled="updateMutation.isPending.value"
              @click="showTemplateWarningModal = true"
            />
            <UButton
              v-if="settings.spreadsheetTemplateId"
              label="התאמת שדות לעמודות"
              icon="i-heroicons-arrows-right-left"
              variant="outline"
              color="primary"
              size="sm"
              :disabled="updateMutation.isPending.value"
              @click="openDefaultMappingModal"
            />
          </div>
          <div v-if="settings.spreadsheetTemplateId && hasMappingEntries" class="AdminSettingsPage__mapping-status">
            <UIcon name="i-heroicons-check-circle" class="AdminSettingsPage__mapping-status-icon" />
            <span>{{ mappingEntriesCount }} שדות מותאמים</span>
          </div>
        </div>
      </section>
    </template>

    <div v-else-if="error" class="AdminSettingsPage__error">
      <p>שגיאה בטעינת ההגדרות</p>
      <UButton label="נסו שנית" variant="outline" @click="refetch" />
    </div>

    <UModal v-model="showTemplateWarningModal">
      <div class="AdminSettingsPage__warning-modal">
        <h3 class="AdminSettingsPage__warning-modal-title">שינוי תבנית הגיליון</h3>
        <p class="AdminSettingsPage__warning-modal-text">
          שינוי התבנית יגרום לכל הטפסים הקיימים שמשתמשים בהתאמת ברירת מחדל לעבור להתאמה מותאמת אישית.
          ההתאמה החדשה תחול רק על טפסים חדשים.
        </p>
        <div class="AdminSettingsPage__warning-modal-actions">
          <UButton
            label="ביטול"
            variant="outline"
            color="gray"
            @click="showTemplateWarningModal = false"
          />
          <UButton
            label="המשך"
            color="primary"
            :loading="picker.isLoading.value || isChangingTemplate"
            @click="confirmPickTemplate"
          />
        </div>
      </div>
    </UModal>

    <AdminColumnMappingModal
      v-model="showMappingModal"
      :spreadsheet-id="mappingSpreadsheetId"
      :initial-mapping="mappingInitial"
      @save="handleMappingSave"
      @cancel="handleMappingCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useAppSettingsQuery, useUpdateAppSettingsMutation } from '~/composables/useAppSettings'
import { useGooglePicker } from '~/composables/useGooglePicker'

definePageMeta({
  layout: 'admin',
  colorMode: 'dark',
})

const { data: settings, isLoading, error, refetch } = useAppSettingsQuery()
const updateMutation = useUpdateAppSettingsMutation()
const picker = useGooglePicker()
const toast = useToast()
const queryClient = useQueryClient()

const showTemplateWarningModal = ref(false)
const showMappingModal = ref(false)
const isChangingTemplate = ref(false)

const mappingSpreadsheetId = ref('')
const mappingInitial = ref<Record<string, string>>({})
const pendingTemplateInfo = ref<{ id: string; name: string; url: string } | null>(null)

const hasMappingEntries = computed(() =>
  settings.value?.columnMapping && Object.keys(settings.value.columnMapping).length > 0,
)

const mappingEntriesCount = computed(() =>
  settings.value?.columnMapping ? Object.keys(settings.value.columnMapping).length : 0,
)

function handleLogoUpdate(value: string | null) {
  const logo = value || '/img/logos/bigidea-logo.svg'
  updateMutation.mutate(
    { defaultPrimaryLogo: logo },
    {
      onSuccess: () => toast.add({ title: 'הלוגו עודכן', color: 'green' }),
      onError: () => toast.add({ title: 'שגיאה בעדכון הלוגו', color: 'red' }),
    },
  )
}

function handleLogoSvgUpdate(value: boolean) {
  updateMutation.mutate(
    { defaultPrimaryLogoSvgToWhite: value },
    {
      onSuccess: () => toast.add({ title: 'ההגדרה עודכנה', color: 'green' }),
      onError: () => toast.add({ title: 'שגיאה בעדכון', color: 'red' }),
    },
  )
}

function openTemplate() {
  if (settings.value?.spreadsheetTemplateUrl) {
    window.open(settings.value.spreadsheetTemplateUrl, '_blank')
  }
}

function handlePickerError(err: unknown) {
  const status = (err as any)?.response?.status ?? (err as any)?.statusCode
  if (status === 401) {
    toast.add({
      title: 'נדרשת התחברות מחדש לגוגל',
      description: 'יש להתנתק ולהתחבר מחדש כדי לאשר הרשאות Google Drive.',
      color: 'red',
    })
  }
  else {
    toast.add({ title: 'שגיאה בפתיחת Google Drive', color: 'red' })
  }
}

function openDefaultMappingModal() {
  if (!settings.value?.spreadsheetTemplateId) return
  mappingSpreadsheetId.value = settings.value.spreadsheetTemplateId
  mappingInitial.value = settings.value.columnMapping ?? {}
  pendingTemplateInfo.value = null
  showMappingModal.value = true
}

async function confirmPickTemplate() {
  showTemplateWarningModal.value = false
  try {
    const spreadsheet = await picker.pickSpreadsheet()
    if (!spreadsheet) return

    isChangingTemplate.value = true
    await $fetch('/api/settings/change-template', {
      method: 'PUT',
      body: {
        spreadsheetTemplateId: spreadsheet.id,
        spreadsheetTemplateName: spreadsheet.name,
        spreadsheetTemplateUrl: spreadsheet.url,
      },
    })

    queryClient.invalidateQueries({ queryKey: ['appSettings'] })
    toast.add({ title: 'התבנית שונתה. טפסים קיימים הועברו להתאמה מותאמת אישית.', color: 'green' })

    pendingTemplateInfo.value = { id: spreadsheet.id, name: spreadsheet.name, url: spreadsheet.url }
    mappingSpreadsheetId.value = spreadsheet.id
    mappingInitial.value = {}
    showMappingModal.value = true
  }
  catch (err) {
    handlePickerError(err)
  }
  finally {
    isChangingTemplate.value = false
  }
}

function handleMappingSave(mapping: Record<string, string>) {
  updateMutation.mutate(
    { columnMapping: mapping },
    {
      onSuccess: () => {
        toast.add({ title: 'התאמת השדות נשמרה', color: 'green' })
        pendingTemplateInfo.value = null
      },
      onError: () => toast.add({ title: 'שגיאה בשמירת ההתאמה', color: 'red' }),
    },
  )
}

function handleMappingCancel() {
  pendingTemplateInfo.value = null
}
</script>

<style>
.AdminSettingsPage {
  max-width: var(--admin-content-width);
  margin: 0 auto;
  padding: 1.5rem;
}

.AdminSettingsPage__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.AdminSettingsPage__title {
  font-size: 1.5rem;
  font-weight: 700;
}

.AdminSettingsPage__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.AdminSettingsPage__error {
  text-align: center;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.AdminSettingsPage__section {
  padding: 1.5rem;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.AdminSettingsPage__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.AdminSettingsPage__section-desc {
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.AdminSettingsPage__template {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.AdminSettingsPage__template-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  max-width: fit-content;
}

.AdminSettingsPage__template-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.AdminSettingsPage__template-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.AdminSettingsPage__template-empty {
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  margin: 0;
}

.AdminSettingsPage__template-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.AdminSettingsPage__mapping-status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
}

.AdminSettingsPage__mapping-status-icon {
  color: #22c55e;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.AdminSettingsPage__warning-modal {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.AdminSettingsPage__warning-modal-title {
  font-size: 1.125rem;
  font-weight: 700;
}

.AdminSettingsPage__warning-modal-text {
  color: var(--ui-text-muted);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin: 0;
}

.AdminSettingsPage__warning-modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>
