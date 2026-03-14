<template>
  <nav class="FormNavigation" :class="{ 'FormNavigation--centered': isFirst }" aria-label="ניווט טופס">
    <button
      v-if="!isFirst"
      type="button"
      class="FormNavigation__btn FormNavigation__btn--secondary"
      @click="$emit('prev')"
    >
      לעמוד הקודם
    </button>
    <div v-else />

    <button
      v-if="isLast"
      type="button"
      class="FormNavigation__btn FormNavigation__btn--primary"
      :disabled="loading"
      :aria-busy="loading || undefined"
      @click="$emit('submit')"
    >
      <span v-if="loading" class="FormNavigation__spinner" aria-hidden="true" />
      <span v-if="loading" class="sr-only">שולח...</span>
      <span v-else>להרשמה</span>
    </button>

    <button
      v-else
      type="button"
      class="FormNavigation__btn FormNavigation__btn--primary"
      @click="$emit('next')"
    >
      לעמוד הבא
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  isFirst: boolean
  isLast: boolean
  loading?: boolean
}>()

defineEmits<{
  prev: []
  next: []
  submit: []
}>()
</script>

<style>
.FormNavigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1rem;
  max-width: 48rem;
  margin: 0 auto;
  gap: 1rem;
}

.FormNavigation--centered {
  justify-content: center;
}

.FormNavigation__btn {
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  font-family: inherit;
  min-width: 8rem;
}

.FormNavigation__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.FormNavigation__btn--primary {
  background: var(--color-brand-primary);
  color: var(--color-brand-white);
  border-color: var(--color-brand-primary);
}

.FormNavigation__btn--primary:hover:not(:disabled) {
  background: var(--color-brand-white);
  color: var(--color-brand-primary);
}

.FormNavigation__btn--secondary {
  background: var(--color-brand-white);
  color: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
}

.FormNavigation__btn--secondary:hover {
  background: var(--color-brand-primary);
  color: var(--color-brand-white);
}

.FormNavigation__spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@media (max-width: 480px) {
  .FormNavigation { padding: 1rem; }
  .FormNavigation__btn { min-width: 6rem; padding: 0.65rem 1.25rem; font-size: 0.9rem; }
}
</style>
