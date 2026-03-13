export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (to.path.startsWith('/admin') && !loggedIn.value) {
    return navigateTo('/login')
  }

  if (to.path === '/login' && loggedIn.value) {
    return navigateTo('/admin')
  }
})
