<template>
  <UModal :model-value="modelValue" :prevent-close="isProcessing" @update:model-value="handleModalUpdate">
    <div class="SpreadsheetSetupModal" dir="rtl">
      <h3 class="SpreadsheetSetupModal__title">חיבור גיליון אלקטרוני</h3>
      <p class="SpreadsheetSetupModal__description">
        {{ mode === 'duplicate' ? 'בחר גיליון אלקטרוני עבור הטופס המשוכפל' : 'כל טופס חייב להיות מחובר לגיליון אלקטרוני שבו יישמרו הנתונים' }}
      </p>

      <div class="SpreadsheetSetupModal__options">
        <div
          class="SpreadsheetSetupModal__option-block"
          :class="{ 'SpreadsheetSetupModal__option-block--selected': selectedMode === 'generate' }"
        >
          <label class="SpreadsheetSetupModal__option">
            <input
              type="radio"
              name="spreadsheetSetupMode"
              value="generate"
              :checked="selectedMode === 'generate'"
              :disabled="isProcessing"
              @change="handleModeChange('generate')"
            />
            <span class="SpreadsheetSetupModal__option-label">יצירת גיליון אלקטרוני חדש</span>
          </label>
          <div v-if="selectedMode === 'generate'" class="SpreadsheetSetupModal__sub-action">
            <UFormGroup label="שם הגיליון החדש" class="SpreadsheetSetupModal__form-group">
              <UInput
                v-model="spreadsheetName"
                dir="rtl"
                size="sm"
                placeholder="הרשמה- קייטנת BIGIDEA"
                :disabled="isProcessing"
                class="SpreadsheetSetupModal__name-input"
              />
            </UFormGroup>
            <div v-if="selectedFolder" class="SpreadsheetSetupModal__chip">
              <UIcon name="i-heroicons-folder" class="SpreadsheetSetupModal__chip-icon" />
              <span class="SpreadsheetSetupModal__chip-text">{{ selectedFolder.name }}</span>
            </div>
            <UButton
              :label="selectedFolder ? 'בחר תיקייה אחרת' : 'בחר תיקייה'"
              icon="i-heroicons-folder-open"
              variant="outline"
              color="gray"
              size="sm"
              block
              :loading="picker.isLoading.value"
              :disabled="isProcessing"
              @click="handlePickFolder"
            />
          </div>
        </div>

        <div
          class="SpreadsheetSetupModal__option-block"
          :class="{ 'SpreadsheetSetupModal__option-block--selected': selectedMode === 'existing' }"
        >
          <label class="SpreadsheetSetupModal__option">
            <input
              type="radio"
              name="spreadsheetSetupMode"
              value="existing"
              :checked="selectedMode === 'existing'"
              :disabled="isProcessing"
              @change="handleModeChange('existing')"
            />
            <span class="SpreadsheetSetupModal__option-label">גיליון אלקטרוני קיים</span>
          </label>
          <div v-if="selectedMode === 'existing'" class="SpreadsheetSetupModal__sub-action">
            <div v-if="selectedSpreadsheet" class="SpreadsheetSetupModal__chip">
              <UIcon name="i-heroicons-table-cells" class="SpreadsheetSetupModal__chip-icon" />
              <a
                :href="selectedSpreadsheet.url"
                target="_blank"
                class="SpreadsheetSetupModal__chip-text SpreadsheetSetupModal__chip-link"
              >
                {{ selectedSpreadsheet.name }}
              </a>
            </div>
            <UButton
              :label="selectedSpreadsheet ? 'בחר גיליון אחר' : 'בחר גיליון'"
              icon="i-heroicons-table-cells"
              variant="outline"
              color="gray"
              size="sm"
              block
              :loading="picker.isLoading.value"
              :disabled="isProcessing"
              @click="handlePickSpreadsheet"
            />
          </div>
        </div>
      </div>

      <div class="SpreadsheetSetupModal__footer">
        <UButton
          label="ביטול"
          variant="outline"
          color="gray"
          :disabled="isProcessing"
          @click="handleCancel"
        />
        <UButton
          :label="mode === 'duplicate' ? 'שכפל טופס' : 'צור טופס'"
          color="primary"
          class="SpreadsheetSetupModal__confirm-btn"
          :loading="isProcessing"
          :disabled="!isReady"
          @click="handleConfirm"
        />
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import type { SpreadsheetInfo } from '~/types/form'
import { useGooglePicker } from '~/composables/useGooglePicker'

const props = defineProps<{
  modelValue: boolean
  mode: 'new' | 'duplicate'
  sourceSpreadsheet?: SpreadsheetInfo | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [payload: {
    mode: 'existing' | 'generate'
    spreadsheet?: SpreadsheetInfo
    folder?: { id: string; name: string }
    spreadsheetName?: string
  }]
  cancel: []
}>()

const picker = useGooglePicker()
const toast = useToast()

const DEFAULT_SPREADSHEET_NAME = 'הרשמה- קייטנת BIGIDEA'

const selectedMode = ref<'existing' | 'generate'>('generate')
const selectedSpreadsheet = ref<SpreadsheetInfo | null>(null)
const selectedFolder = ref<{ id: string; name: string } | null>(null)
const spreadsheetName = ref(DEFAULT_SPREADSHEET_NAME)
const isProcessing = ref(false)

const isReady = computed(() => {
  if (isProcessing.value) return false
  if (selectedMode.value === 'existing') return !!selectedSpreadsheet.value?.id
  if (selectedMode.value === 'generate') {
    return !!selectedFolder.value?.id && !!spreadsheetName.value?.trim()
  }
  return false
})

watch(() => props.modelValue, (open) => {
  if (open) {
    if (props.mode === 'duplicate' && props.sourceSpreadsheet?.id) {
      selectedMode.value = 'existing'
      selectedSpreadsheet.value = { ...props.sourceSpreadsheet }
      spreadsheetName.value = `${props.sourceSpreadsheet.name} (העתק)`
    }
    else {
      selectedMode.value = 'generate'
      selectedSpreadsheet.value = null
      spreadsheetName.value = DEFAULT_SPREADSHEET_NAME
    }
    selectedFolder.value = null
    isProcessing.value = false
  }
})

function handleModeChange(mode: 'existing' | 'generate') {
  selectedMode.value = mode
}

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

async function handlePickFolder() {
  try {
    const folder = await picker.pickFolder()
    if (folder) selectedFolder.value = folder
  }
  catch (err) {
    handlePickerError(err)
  }
}

async function handlePickSpreadsheet() {
  try {
    const spreadsheet = await picker.pickSpreadsheet()
    if (spreadsheet) selectedSpreadsheet.value = spreadsheet
  }
  catch (err) {
    handlePickerError(err)
  }
}

function handleConfirm() {
  if (!isReady.value) return
  isProcessing.value = true

  if (selectedMode.value === 'existing' && selectedSpreadsheet.value) {
    emit('confirm', { mode: 'existing', spreadsheet: selectedSpreadsheet.value })
  }
  else if (selectedMode.value === 'generate' && selectedFolder.value) {
    emit('confirm', {
      mode: 'generate',
      folder: selectedFolder.value,
      spreadsheetName: spreadsheetName.value?.trim() || DEFAULT_SPREADSHEET_NAME,
    })
  }
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleModalUpdate(value: boolean) {
  if (!value && !isProcessing.value) {
    emit('update:modelValue', false)
  }
}

defineExpose({ resetProcessing: () => { isProcessing.value = false } })
</script>

<style>
.SpreadsheetSetupModal {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.SpreadsheetSetupModal__title {
  font-size: 1.125rem;
  font-weight: 700;
}

.SpreadsheetSetupModal__description {
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  line-height: 1.6;
}

.SpreadsheetSetupModal__options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.SpreadsheetSetupModal__option-block {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: border-color 0.15s ease;
}

.SpreadsheetSetupModal__option-block--selected {
  border-color: rgba(0, 205, 255, 0.4);
}

.SpreadsheetSetupModal__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.SpreadsheetSetupModal__option input[type="radio"] {
  accent-color: var(--color-brand-primary);
}

.SpreadsheetSetupModal__option-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.SpreadsheetSetupModal__sub-action {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding-right: 1.25rem;
}

.SpreadsheetSetupModal__form-group {
  margin-bottom: 0;
}

.SpreadsheetSetupModal__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: var(--ui-text-muted);
  min-width: 0;
  max-width: fit-content;
}

.SpreadsheetSetupModal__chip-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.SpreadsheetSetupModal__chip-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.SpreadsheetSetupModal__chip-link {
  color: var(--color-brand-primary);
  text-decoration: none;
}

.SpreadsheetSetupModal__chip-link:hover {
  text-decoration: underline;
}

.SpreadsheetSetupModal__footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  margin-top: 0.25rem;
  border-top: 1px solid var(--ui-border);
}

.SpreadsheetSetupModal__confirm-btn {
  color: white !important;
}
</style>
