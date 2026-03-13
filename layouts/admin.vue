<template>
  <div class="AdminLayout">
    <header class="AdminLayout__header">
      <div class="AdminLayout__header-inner">
        <div class="AdminLayout__brand">
          <img src="/img/logos/bigidea-logo-admin.png" alt="BIGIDEA" class="AdminLayout__logo">
          <span class="AdminLayout__title">מחולל הטפסים של BIGIDEA</span>
        </div>

        <div v-if="user" class="AdminLayout__user">
          <UDropdown :items="userMenuItems">
            <UButton variant="ghost" color="gray" size="sm" class="AdminLayout__user-trigger">
              <span>{{ user.name }}</span>
              <UAvatar
                v-if="user.picture"
                :src="user.picture"
                size="xs"
              />
              <UIcon
                v-else
                name="i-heroicons-user-circle"
                class="AdminLayout__user-placeholder"
              />
            </UButton>
          </UDropdown>
        </div>
      </div>
    </header>

    <main class="AdminLayout__content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/login')
}

const userMenuItems = computed(() => [
  [
    {
      label: 'התנתקות',
      icon: 'i-heroicons-arrow-right-start-on-rectangle',
      click: () => handleLogout(),
    },
  ],
])
</script>

<style>
.AdminLayout {
  min-height: 100vh;
  background: var(--ui-bg);
}

.AdminLayout__header {
  background: var(--ui-bg-elevated);
  border-bottom: 1px solid var(--ui-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.AdminLayout__header-inner {
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.AdminLayout__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.AdminLayout__logo {
  height: 1.5rem;
  width: auto;
  object-fit: contain;
}

.AdminLayout__title {
  font-size: 1.1rem;
  font-weight: 700;
}

.AdminLayout__user {
  display: flex;
  align-items: center;
}

.AdminLayout__user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.AdminLayout__user-placeholder {
  font-size: 1.25rem;
  color: var(--ui-text-muted);
}

.AdminLayout__content {
  min-height: 0;
}

/* Back office input styling – match RichTextEditor (background, border, no focus ring) */
.AdminLayout input:not([type="file"]),
.AdminLayout textarea {
  background: var(--ui-bg) !important;
  border: 1px solid var(--ui-border) !important;
  border-radius: 0.5rem;
  outline: none !important;
  box-shadow: none !important;
}

.AdminLayout input:not([type="file"]):focus,
.AdminLayout textarea:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: var(--ui-border);
}

/* Preview inputs must use front form styling (brand colors), not back office */
.AdminLayout .FieldPreviewCard__preview input,
.AdminLayout .FieldPreviewCard__preview textarea {
  background: var(--color-brand-input-bg) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: var(--color-brand-white) !important;
}

.AdminLayout .FieldPreviewCard__preview input::placeholder,
.AdminLayout .FieldPreviewCard__preview textarea::placeholder {
  color: rgba(255, 255, 255, 0.4) !important;
}
</style>
