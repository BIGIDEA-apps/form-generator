<template>
  <section class="FormsList">
    <UTable :rows="forms" :columns="columns">
      <template #formName-data="{ row }">
        <span class="FormsList__cell-truncate">{{ row.formName || '-' }}</span>
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

      <template #actions-data="{ row }">
        <div class="FormsList__actions">
          <UTooltip text="עריכה">
            <UButton
              icon="i-heroicons-pencil-square"
              variant="ghost"
              color="gray"
              size="xs"
              @click="$emit('edit', row)"
            />
          </UTooltip>
          <UTooltip text="שכפול">
            <UButton
              icon="i-heroicons-document-duplicate"
              variant="ghost"
              color="gray"
              size="xs"
              @click="$emit('duplicate', row)"
            />
          </UTooltip>
          <UTooltip text="העתקת קישור">
            <UButton
              icon="i-heroicons-link"
              variant="ghost"
              color="gray"
              size="xs"
              @click="$emit('copy-link', row)"
            />
          </UTooltip>
          <UTooltip text="מחיקה">
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="red"
              size="xs"
              @click="$emit('delete', row)"
            />
          </UTooltip>
        </div>
      </template>
    </UTable>
  </section>
</template>

<script setup lang="ts">
import type { FormConfig } from '~/types/form'

defineProps<{
  forms: FormConfig[]
}>()

defineEmits<{
  edit: [form: FormConfig]
  duplicate: [form: FormConfig]
  delete: [form: FormConfig]
  'copy-link': [form: FormConfig]
}>()

const columns = [
  { key: 'formName', label: 'שם הטופס' },
  { key: 'company', label: 'חברה' },
  { key: 'status', label: 'סטטוס' },
  { key: 'createdAt', label: 'תאריך יצירה' },
  { key: 'actions', label: '' },
]

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
.FormsList__actions {
  display: flex;
  gap: 0.25rem;
}

.FormsList__cell-truncate {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
