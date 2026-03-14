export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const session = await getUserSession(event)
  const accessToken = (session as any)?.secure?.accessToken

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'No Google token. Please re-login.' })
  }

  const query = getQuery(event)
  const spreadsheetId = String(query.spreadsheetId || '')

  if (!spreadsheetId) {
    throw createError({ statusCode: 400, statusMessage: 'spreadsheetId is required' })
  }

  try {
    const response = await $fetch<{ values?: string[][] }>(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/1:1`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    return { headers: response.values?.[0] ?? [] }
  }
  catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 502,
      statusMessage: `Failed to read spreadsheet headers: ${err?.data?.error?.message || err.message}`,
    })
  }
})
