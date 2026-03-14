<template>
  <section class="FormsList">
    <div class="FormsList__card" @click="handleRowClick">
      <UTable :rows="forms" :columns="columns" class="FormsList__table">
        <template #formName-data="{ row }">
          <span class="FormsList__cell-truncate FormsList__title">{{ row.formName || '-' }}</span>
        </template>

        <template #company-data="{ row }">
          <span class="FormsList__cell-truncate">{{ row.company || '-' }}</span>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :color="row.isActive ? 'green' : 'gray'"
            variant="subtle"
            :label="row.isActive ? 'פעיל' : 'לא פעיל'"
          />
        </template>

        <template #createdAt-data="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>

        <template #submissionsCount-data="{ row }">
          <span class="FormsList__cell-truncate">{{ row.submissionsCount ?? 0 }}</span>
        </template>

        <template #actions-data="{ row }">
          <div class="FormsList__actions" @click.stop dir="rtl">
            <UTooltip text="לצפייה בטופס">
              <UButton
                icon="i-heroicons-arrow-top-right-on-square"
                variant="ghost"
                color="gray"
                size="sm"
                @click="$emit('open-form', row)"
              />
            </UTooltip>
            <UTooltip text="העתקת קישור">
              <UButton
                icon="i-heroicons-link"
                variant="ghost"
                color="gray"
                size="sm"
                @click="$emit('copy-link', row)"
              />
            </UTooltip>
            <UTooltip v-if="row.spreadsheet?.url" text="פתיחת גיליון מחובר">
              <UButton
                icon="i-heroicons-table-cells"
                variant="ghost"
                color="gray"
                size="sm"
                @click="row.spreadsheet?.url && openInNewTab(row.spreadsheet.url)"
              />
            </UTooltip>
            <UTooltip text="הרשמות">
              <NuxtLink
                v-if="row._id"
                :to="`/admin/forms/${row._id}/submissions`"
                class="inline-flex items-center justify-center"
                @click.stop
              >
                <UButton
                  icon="i-heroicons-clipboard-document-list"
                  variant="ghost"
                  color="gray"
                  size="sm"
                />
              </NuxtLink>
              <UButton
                v-else
                icon="i-heroicons-clipboard-document-list"
                variant="ghost"
                color="gray"
                size="sm"
                disabled
              />
            </UTooltip>
            <UTooltip text="שכפול">
              <UButton
                icon="i-heroicons-document-duplicate"
                variant="ghost"
                color="gray"
                size="sm"
                @click="$emit('duplicate', row)"
              />
            </UTooltip>
            <UTooltip text="מחיקה">
              <UButton
                icon="i-heroicons-trash"
                variant="ghost"
                color="red"
                size="sm"
                @click="$emit('delete', row)"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FormConfig } from '~/types/form'

const props = defineProps<{
  forms: FormConfig[]
}>()

const emit = defineEmits<{
  edit: [form: FormConfig]
  'open-form': [form: FormConfig]
  'view-submissions': [form: FormConfig]
  duplicate: [form: FormConfig]
  delete: [form: FormConfig]
  'copy-link': [form: FormConfig]
}>()

function handleRowClick(e: MouseEvent) {
  if ((e.target as Element).closest('.FormsList__actions')) return
  const tr = (e.target as Element).closest('tbody tr')
  if (!tr?.parentElement) return
  const index = Array.from(tr.parentElement.children).indexOf(tr as HTMLTableRowElement)
  const form = props.forms[index]
  if (form) emit('edit', form)
}

const columns = [
  { key: 'formName', label: 'שם הטופס' },
  { key: 'company', label: 'חברה' },
  { key: 'status', label: 'סטטוס' },
  { key: 'submissionsCount', label: 'הרשמות' },
  { key: 'createdAt', label: 'תאריך יצירה' },
  { key: 'actions', label: '' },
]

function openInNewTab(url: string) {
  if (import.meta.client) window.open(url, '_blank')
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style>
.FormsList__card {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  overflow: hidden;
}

.FormsList__table {
  width: 100%;
}

.FormsList tbody tr {
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.FormsList tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.FormsList tbody tr:hover .FormsList__title {
  color: var(--color-brand-primary);
}

.FormsList__title {
  transition: color 0.15s ease;
}

.FormsList__cell-truncate {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.FormsList__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  cursor: default;
}
</style>
