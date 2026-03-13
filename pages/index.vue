<template>
  <div />
</template>

<script setup lang="ts">
const { loggedIn } = useUserSession()

onMounted(() => {
  navigateTo(loggedIn.value ? '/admin' : '/login')
})
</script>
