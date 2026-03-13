<template>
  <nav class="FormNavigation">
    <button
      v-if="!isFirst"
      type="button"
      class="FormNavigation__btn FormNavigation__btn--secondary"
      @click="$emit('prev')"
    >
      לדף הקודם
    </button>
    <div v-else />

    <button
      v-if="isLast"
      type="button"
      class="FormNavigation__btn FormNavigation__btn--primary"
      :disabled="loading"
      @click="$emit('submit')"
    >
      <span v-if="loading" class="FormNavigation__spinner" />
      <span v-else>שליחת הטופס</span>
    </button>

    <button
      v-else
      type="button"
      class="FormNavigation__btn FormNavigation__btn--primary"
      @click="$emit('next')"
    >
      המשך
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

</style>
