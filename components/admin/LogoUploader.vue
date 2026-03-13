<template>
  <section class="LogoUploader">
    <label class="LogoUploader__label">{{ label }}</label>

    <div
      v-if="modelValue"
      class="LogoUploader__preview"
      :class="{
        'LogoUploader__preview--dragover': isDragOver && !uploading,
        'LogoUploader__preview--loading': uploading,
      }"
      @mouseenter="!uploading && (showActions = true)"
      @mouseleave="showActions = false"
      @dragenter.prevent="!uploading && (isDragOver = true)"
      @dragover.prevent="!uploading && (isDragOver = true)"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="!uploading && handleDrop($event)"
    >
      <template v-if="uploading">
        <div class="LogoUploader__spinner" />
      </template>
      <template v-else>
        <img :src="modelValue" :alt="label" class="LogoUploader__image">
        <div v-if="showActions" class="LogoUploader__actions">
        <UButton
          icon="i-heroicons-arrow-path"
          size="xs"
          color="white"
          @click="triggerFileInput"
        />
        <UButton
          v-if="!isRequired"
          icon="i-heroicons-trash"
          size="xs"
          color="red"
          @click="removeLogo"
        />
      </div>
      </template>
    </div>

    <div
      v-else
      class="LogoUploader__dropzone"
      :class="{
        'LogoUploader__dropzone--dragover': isDragOver && !uploading,
        'LogoUploader__dropzone--loading': uploading,
      }"
      @dragenter.prevent="!uploading && (isDragOver = true)"
      @dragover.prevent="!uploading && (isDragOver = true)"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="!uploading && handleDrop($event)"
      @click="!uploading && triggerFileInput()"
    >
      <template v-if="uploading">
        <div class="LogoUploader__spinner" />
      </template>
      <template v-else>
        <UIcon name="i-heroicons-cloud-arrow-up" class="LogoUploader__dropzone-icon" />
        <p class="LogoUploader__dropzone-text">גררו לוגו לכאן או לחצו להעלאה</p>
        <p class="LogoUploader__dropzone-hint">PNG, SVG, WEBP (עד 5MB)</p>
      </template>
    </div>

    <div
      class="LogoUploader__svg-toggle"
      :class="{ 'LogoUploader__svg-toggle--disabled': !isSvg && modelValue }"
    >
      <UTooltip v-if="!isSvg && modelValue">
        <template #text>
          <span class="LogoUploader__tooltip-content">
            <UIcon name="i-heroicons-exclamation-triangle" class="LogoUploader__tooltip-icon" />
            הלוגו אינו SVG
          </span>
        </template>
        <div class="LogoUploader__svg-toggle-inner">
          <UToggle
            :model-value="svgToWhite ?? false"
            :disabled="true"
            @update:model-value="emit('update:svgToWhite', $event)"
          />
          <span class="LogoUploader__svg-toggle-label">המר SVG לצבע לבן</span>
        </div>
      </UTooltip>
      <div v-else class="LogoUploader__svg-toggle-inner">
        <UToggle
          :model-value="svgToWhite ?? false"
          @update:model-value="emit('update:svgToWhite', $event)"
        />
        <span class="LogoUploader__svg-toggle-label">המר SVG לצבע לבן</span>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept=".png,.svg,.webp,image/png,image/svg+xml,image/webp"
      class="LogoUploader__file-input"
      @change="handleFileSelect"
    >
    <p v-if="error" class="LogoUploader__error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
  label: string
  isRequired?: boolean
  svgToWhite?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:svgToWhite': [value: boolean]
}>()

const fileInputRef = ref<HTMLInputElement>()
const isDragOver = ref(false)
const showActions = ref(false)
const uploading = ref(false)
const error = ref('')

function triggerFileInput() {
  fileInputRef.value?.click()
}

function removeLogo() {
  emit('update:modelValue', null)
}

async function uploadFile(file: File) {
  error.value = ''
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    })

    emit('update:modelValue', result.url)
  }
  catch (err: any) {
    error.value = err?.data?.statusMessage || 'העלאה נכשלה'
  }
  finally {
    uploading.value = false
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) uploadFile(file)
  input.value = ''
}

const ACCEPTED_TYPES = ['image/png', 'image/svg+xml', 'image/webp']
const ACCEPTED_EXT = ['.png', '.svg', '.webp']

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true
  const name = file.name?.toLowerCase() ?? ''
  return ACCEPTED_EXT.some(ext => name.endsWith(ext))
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && isAcceptedFile(file)) uploadFile(file)
}

const isSvg = computed(() => !!props.modelValue?.toLowerCase().includes('.svg'))
</script>

<style>
.LogoUploader {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.LogoUploader__label {
  font-size: 0.875rem;
  font-weight: 600;
}

.LogoUploader__preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12rem;
  height: 6rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--ui-bg);
  overflow: hidden;
  cursor: pointer;
}

.LogoUploader__preview--dragover {
  border-color: #00CDFF;
  background: rgba(0, 205, 255, 0.05);
}

.LogoUploader__preview--loading {
  cursor: not-allowed;
  pointer-events: none;
}

.LogoUploader__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}

.LogoUploader__actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
}

.LogoUploader__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 12rem;
  height: 6rem;
  padding: 1rem;
  border: 2px dashed var(--ui-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.LogoUploader__dropzone:hover:not(.LogoUploader__dropzone--loading),
.LogoUploader__dropzone--dragover {
  border-color: #00CDFF;
  background: rgba(0, 205, 255, 0.05);
}

.LogoUploader__dropzone--loading {
  cursor: not-allowed;
  pointer-events: none;
}

.LogoUploader__spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--ui-border);
  border-top-color: #00CDFF;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.LogoUploader__dropzone-icon {
  font-size: 2rem;
  color: var(--ui-text-muted);
}

.LogoUploader__dropzone-text {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
}

.LogoUploader__dropzone-hint {
  font-size: 0.7rem;
  color: var(--ui-text-muted);
  text-align: center;
}

.LogoUploader__svg-toggle {
  margin-top: 0.25rem;
}

.LogoUploader__svg-toggle-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.LogoUploader__svg-toggle-label {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}

.LogoUploader__svg-toggle--disabled .LogoUploader__svg-toggle-label {
  color: var(--ui-text-muted);
  opacity: 0.8;
}

.LogoUploader__tooltip-content {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.LogoUploader__tooltip-icon {
  font-size: 1rem;
  color: var(--ui-color-yellow-500, #eab308);
  flex-shrink: 0;
}

.LogoUploader__file-input {
  display: none;
}

.LogoUploader__error {
  font-size: 0.8rem;
  color: #ef4444;
}
</style>
