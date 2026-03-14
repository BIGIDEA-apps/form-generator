<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <div class="ColumnMappingModal" dir="rtl">
      <h3 class="ColumnMappingModal__title">התאמת שדות לעמודות בגיליון</h3>

      <div v-if="loading" class="ColumnMappingModal__loading">
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
      </div>

      <div v-else-if="fetchError" class="ColumnMappingModal__error">
        <p>שגיאה בטעינת כותרות הגיליון</p>
        <p class="ColumnMappingModal__error-detail">{{ fetchError }}</p>
      </div>

      <template v-else>
        <p class="ColumnMappingModal__desc">
          בחרו עבור כל שדה את העמודה המתאימה בגיליון
        </p>

        <p v-if="hasDuplicateColumns" class="ColumnMappingModal__dup-warning">
          אין לבחור את אותה עמודה פעמיים
        </p>
        <div class="ColumnMappingModal__list">
          <div
            v-for="field in mappableFields"
            :key="field.key"
            class="ColumnMappingModal__row"
            :class="{ 'ColumnMappingModal__row--error': isDuplicateColumn(field.key) }"
          >
            <span class="ColumnMappingModal__field-label">{{ field.label }}</span>
            <USelectMenu
              v-model="localMapping[field.key]"
              :options="headerOptions"
              searchable
              clear-search-on-close
              :search-attributes="['label']"
              placeholder="ללא התאמה"
              value-attribute="value"
              option-attribute="label"
              size="sm"
              class="ColumnMappingModal__select"
              :ui-menu="{ height: 'max-h-48' }"
            />
          </div>
        </div>
      </template>

      <div class="ColumnMappingModal__actions">
        <UButton
          label="ביטול"
          variant="outline"
          color="gray"
          @click="handleCancel"
        />
        <UButton
          label="שמירה"
          color="primary"
          :disabled="loading || !!fetchError || hasDuplicateColumns"
          @click="handleSave"
        />
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { FIELD_DEFINITIONS } from '~/utils/fieldDefinitions'

const props = defineProps<{
  modelValue: boolean
  spreadsheetId: string
  initialMapping?: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [mapping: Record<string, string>]
  cancel: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const loading = ref(false)
const fetchError = ref('')
const headers = ref<string[]>([])
const localMapping = ref<Record<string, string | null>>({})

const META_FIELDS = [
  { key: 'submissionId', label: 'מזהה הרשמה' },
  { key: 'submittedAt', label: 'תאריך הרשמה' },
  { key: 'formName', label: 'שם הטופס' },
  { key: 'company', label: 'חברה' },
]

const EXCLUDED_FIELD_KEYS = new Set(['companyByUserString', 'companyByUserSelect'])

const mappableFields = computed(() => {
  const fields = FIELD_DEFINITIONS
    .filter(f => f.inputType !== 'display' && !EXCLUDED_FIELD_KEYS.has(f.key))
    .map(f => ({ key: f.key, label: f.label }))

  return [...META_FIELDS, ...fields]
})

const headerOptions = computed(() => {
  return [
    { label: 'ללא התאמה', value: '' },
    ...headers.value.map(h => ({ label: h, value: h })),
  ]
})

const duplicateColumns = computed(() => {
  const values = Object.values(localMapping.value).filter((v): v is string => !!v && String(v).trim())
  const counts = new Map<string, number>()
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return new Set([...counts.entries()].filter(([, c]) => c > 1).map(([v]) => v))
})

const hasDuplicateColumns = computed(() => duplicateColumns.value.size > 0)

function isDuplicateColumn(fieldKey: string): boolean {
  const col = localMapping.value[fieldKey]
  return !!(col && String(col).trim() && duplicateColumns.value.has(col))
}

async function fetchHeaders() {
  if (!props.spreadsheetId) {
    fetchError.value = 'לא הוגדר גיליון'
    return
  }

  loading.value = true
  fetchError.value = ''
  try {
    const res = await $fetch<{ headers: string[] }>('/api/spreadsheet/headers', {
      params: { spreadsheetId: props.spreadsheetId },
    })
    headers.value = res.headers
  }
  catch (err: any) {
    fetchError.value = err?.data?.statusMessage || err?.message || 'שגיאה לא ידועה'
  }
  finally {
    loading.value = false
  }
}

function initializeMapping() {
  const mapping: Record<string, string | null> = {}
  for (const field of mappableFields.value) {
    mapping[field.key] = props.initialMapping?.[field.key] ?? ''
  }
  localMapping.value = mapping
}

watch(() => props.modelValue, (open) => {
  if (open) {
    initializeMapping()
    fetchHeaders()
  }
})

function handleSave() {
  if (hasDuplicateColumns.value) return
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(localMapping.value)) {
    if (value) {
      result[key] = value
    }
  }
  emit('save', result)
  isOpen.value = false
}

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

<style>
.ColumnMappingModal {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ColumnMappingModal__title {
  font-size: 1.125rem;
  font-weight: 700;
}

.ColumnMappingModal__desc {
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  margin: 0;
}

.ColumnMappingModal__loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
}

.ColumnMappingModal__error {
  padding: 1rem 0;
  text-align: center;
  color: #ef4444;
}

.ColumnMappingModal__error-detail {
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  margin-top: 0.25rem;
}

.ColumnMappingModal__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 24rem;
  overflow-y: auto;
  padding-left: 0.25rem;
}

.ColumnMappingModal__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ColumnMappingModal__row--error {
  padding: 0.5rem;
  margin: 0 -0.5rem;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
}

.ColumnMappingModal__dup-warning {
  font-size: 0.8125rem;
  color: #ef4444;
  margin: 0;
}

.ColumnMappingModal__field-label {
  flex: 0 0 10rem;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ColumnMappingModal__select {
  flex: 1;
  min-width: 0;
}

.ColumnMappingModal__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--ui-border);
}
</style>
