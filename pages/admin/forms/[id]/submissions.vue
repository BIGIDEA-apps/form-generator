<template>
  <div class="SubmissionsPage">
    <div class="SubmissionsPage__header">
      <UButton
        icon="i-heroicons-arrow-right"
        variant="ghost"
        color="gray"
        @click="navigateTo('/admin')"
      />
      <h1 class="SubmissionsPage__title">
        הרשמות — {{ formData?.formName || '...' }}
      </h1>
    </div>

    <div class="SubmissionsPage__toolbar">
      <UInput
        v-model="searchInput"
        icon="i-heroicons-magnifying-glass"
        placeholder="חיפוש בהרשמות..."
        dir="rtl"
        size="sm"
        class="SubmissionsPage__search"
      />
    </div>

    <div v-if="isLoadingForm || isLoadingSubmissions" class="SubmissionsPage__loading">
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-12 w-full" />
    </div>

    <div v-else-if="formError || submissionsError" class="SubmissionsPage__error">
      <p>שגיאה בטעינת הנתונים</p>
      <UButton label="חזרה לרשימה" variant="outline" @click="navigateTo('/admin')" />
    </div>

    <template v-else-if="tableRows.length">
      <div class="SubmissionsPage__card">
        <div class="SubmissionsPage__table-wrapper">
          <UTable :rows="tableRows" :columns="tableColumns" class="SubmissionsPage__table" />
        </div>
      </div>

      <div class="SubmissionsPage__pagination">
        <UPagination
          v-model="page"
          :total="submissionsData?.total ?? 0"
          :page-count="LIMIT"
          :disabled="(submissionsData?.total ?? 0) <= LIMIT"
        />
      </div>
    </template>

    <div v-else-if="searchQuery" class="SubmissionsPage__empty">
      <UIcon name="i-heroicons-magnifying-glass" class="SubmissionsPage__empty-icon" />
      <p>לא נמצאו הרשמות התואמות לחיפוש</p>
      <UButton label="נקה חיפוש" variant="outline" @click="clearSearch" />
    </div>

    <div v-else class="SubmissionsPage__empty">
      <UIcon name="i-heroicons-clipboard-document-list" class="SubmissionsPage__empty-icon" />
      <p>אין הרשמות עדיין</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormConfig, FormSubmission, FieldConfig } from '~/types/form'

definePageMeta({
  layout: 'admin',
  colorMode: 'dark',
})

const LIMIT = 30

const route = useRoute()
const formId = computed(() => route.params.id as string)

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

const { data: formData, isLoading: isLoadingForm, error: formError } = useFormQuery(formId)

const {
  data: submissionsData,
  isLoading: isLoadingSubmissions,
  error: submissionsError,
} = useSubmissionsQuery(formId, {
  page,
  limit: ref(LIMIT),
  search: searchQuery,
})

function clearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  page.value = 1
}

const SPECIAL_FALLBACK_KEYS = ['campSession', 'campRound'] as const

const visibleColumns = computed(() => {
  if (!formData.value?.fields) return []
  const fields = formData.value.fields
  const cols: { key: string; label: string }[] = []

  const companyCol = resolveCompanyColumn(formData.value, fields)
  if (companyCol) cols.push(companyCol)

  const entries = Object.entries(fields) as [string, FieldConfig][]
  for (const [key, field] of entries) {
    if (field.inputType === 'display') continue
    if (key === 'companyByUserString' || key === 'companyByUserSelect') continue

    if (SPECIAL_FALLBACK_KEYS.includes(key as any)) {
      if (field.visible || (!field.visible && typeof field.fallbackValue === 'string' && field.fallbackValue !== '')) {
        cols.push({ key, label: field.label })
      }
      continue
    }

    if (field.visible) {
      cols.push({ key, label: field.label })
    }
  }

  return cols
})

function resolveCompanyColumn(
  form: FormConfig,
  fields: Record<string, FieldConfig>,
): { key: string; label: string } | null {
  if (form.company) return { key: '__company', label: 'חברה' }
  if (fields.companyByUserString?.visible) return { key: '__company', label: 'חברה' }
  if (fields.companyByUserSelect?.visible) return { key: '__company', label: 'חברה' }
  return null
}

function getCompanyValue(form: FormConfig, submission: FormSubmission): string {
  if (form.company) return form.company
  if (form.fields?.companyByUserString?.visible) return submission.data?.companyByUserString ?? ''
  if (form.fields?.companyByUserSelect?.visible) return submission.data?.companyByUserSelect ?? ''
  return ''
}

const tableColumns = computed(() => {
  const cols = visibleColumns.value.map((c: { key: string; label: string }) => ({
    key: c.key,
    label: c.label,
  }))
  cols.push({ key: 'submittedAt', label: 'תאריך הרשמה' })
  return cols
})

const tableRows = computed(() => {
  if (!submissionsData.value?.items || !formData.value) return []

  return submissionsData.value.items.map((sub: FormSubmission) => {
    const row: Record<string, any> = {}

    for (const col of visibleColumns.value) {
      if (col.key === '__company') {
        row[col.key] = getCompanyValue(formData.value!, sub)
      }
      else {
        row[col.key] = sub.data?.[col.key] ?? ''
      }
    }

    row.submittedAt = formatDate(sub.submittedAt)
    return row
  })
})

function formatDate(date: string | Date | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style>
.SubmissionsPage {
  max-width: var(--admin-content-width);
  margin: 0 auto;
  padding: 1.5rem;
}

.SubmissionsPage__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.SubmissionsPage__title {
  font-size: 1.5rem;
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.SubmissionsPage__toolbar {
  margin-bottom: 1rem;
}

.SubmissionsPage__search {
  max-width: 20rem;
}

.SubmissionsPage__card {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.SubmissionsPage__table-wrapper {
  overflow-x: auto;
}

.SubmissionsPage__table {
  width: 100%;
}

.SubmissionsPage__table th,
.SubmissionsPage__table td {
  white-space: nowrap;
  min-width: 8rem;
}

.SubmissionsPage__pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.SubmissionsPage__loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.SubmissionsPage__error {
  text-align: center;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.SubmissionsPage__empty {
  text-align: center;
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--ui-text-muted);
}

.SubmissionsPage__empty-icon {
  font-size: 3rem;
}
</style>
