export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const session = await getUserSession(event)
  const accessToken = (session as any)?.secure?.accessToken

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'No Google token available. Please re-login.' })
  }

  return { accessToken }
})
