<template>
  <div class="SpreadsheetPicker" dir="rtl">
    <div v-if="store.form?.spreadsheet?.id" class="SpreadsheetPicker__connected">
      <div class="SpreadsheetPicker__selection">
        <UIcon name="i-heroicons-table-cells" class="SpreadsheetPicker__selection-icon" />
        <a
          :href="store.form.spreadsheet.url"
          target="_blank"
          class="SpreadsheetPicker__selection-name SpreadsheetPicker__selection-link"
        >
          {{ store.form.spreadsheet.name }}
        </a>
      </div>
      <UButton
        label="החלף גיליון"
        icon="i-heroicons-arrow-path"
        variant="outline"
        color="gray"
        size="sm"
        :loading="picker.isLoading.value"
        @click="handleReplaceSpreadsheet"
      />
    </div>
    <div v-else class="SpreadsheetPicker__no-spreadsheet">
      <span>לא מחובר גיליון אלקטרוני</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormEditorStore } from '~/stores/formEditor'
import { useGooglePicker } from '~/composables/useGooglePicker'

const store = useFormEditorStore()
const picker = useGooglePicker()
const toast = useToast()

function handlePickerError(err: any) {
  const status = err?.response?.status || err?.statusCode
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

async function handleReplaceSpreadsheet() {
  try {
    const spreadsheet = await picker.pickSpreadsheet()
    if (spreadsheet && store.form) {
      await $fetch('/api/spreadsheet/share', {
        method: 'POST',
        body: { spreadsheetId: spreadsheet.id },
      })
      store.updateFormField('spreadsheet', {
        id: spreadsheet.id,
        name: spreadsheet.name,
        url: spreadsheet.url,
      })
    }
  }
  catch (err) {
    handlePickerError(err)
  }
}
</script>

<style>
.SpreadsheetPicker__selection {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  min-width: 0;
}

.SpreadsheetPicker__selection-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.SpreadsheetPicker__selection-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.SpreadsheetPicker__selection-link {
  color: #00CDFF;
  text-decoration: none;
}

.SpreadsheetPicker__selection-link:hover {
  text-decoration: underline;
}

.SpreadsheetPicker__connected {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.SpreadsheetPicker__no-spreadsheet {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}
</style>
