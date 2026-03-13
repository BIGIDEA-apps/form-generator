<template>
  <Teleport to="body">
    <div class="Notify" aria-live="polite">
      <TransitionGroup name="Notify__slide">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="Notify__item"
        >
          {{ item.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { notifications } = useNotify()
</script>

<style>
.Notify {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}

.Notify__item {
  padding: 0.75rem 1.25rem;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.9375rem;
  white-space: nowrap;
  width: fit-content;
}

.Notify__slide-enter-active,
.Notify__slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.Notify__slide-enter-from {
  opacity: 0;
  transform: translateY(-1rem);
}

.Notify__slide-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}

.Notify__slide-move {
  transition: transform 0.3s ease;
}
</style>
