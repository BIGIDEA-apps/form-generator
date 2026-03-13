<template>
  <main class="LoginPage">
    <section class="LoginPage__card">
      <img
        src="/img/logos/bigidea-logo-admin.png"
        alt="BIGIDEA"
        class="LoginPage__logo"
      >
      <h1 class="LoginPage__title">מחולל הטפסים של BIGIDEA</h1>
      <p class="LoginPage__subtitle">התחברו עם חשבון Google של הארגון</p>

      <p v-if="errorMessage" class="LoginPage__error">
        {{ errorMessage }}
      </p>

      <a
        href="/api/auth/google"
        class="LoginPage__google-btn"
      >
        <svg class="LoginPage__google-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        התחברות עם Google
      </a>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()

const errorMessage = computed(() => {
  const error = route.query.error as string
  if (error === 'unauthorized') {
    return 'אין לך הרשאה לגשת למערכת. רק משתמשי @bigideas.co.il יכולים להתחבר.'
  }
  if (error === 'auth_failed') {
    return 'ההתחברות נכשלה. אנא נסו שנית.'
  }
  return null
})
</script>

<style>
.LoginPage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand-bg);
  padding: 1rem;
}

.LoginPage__card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 26rem;
  width: 100%;
}

.LoginPage__logo {
  width: 10rem;
  margin: 0 auto 1.5rem;
}

.LoginPage__title {
  color: white;
  font-size: 1.75rem;
  margin: 0 0 0.5rem;
}

.LoginPage__subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0 0 2rem;
}

.LoginPage__error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.LoginPage__google-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  color: #333;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.2s;
}

.LoginPage__google-btn:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

.LoginPage__google-icon {
  flex-shrink: 0;
}
</style>
