import { getServiceAccountCredentials } from '~/server/utils/googleSheets'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const session = await getUserSession(event)
  const accessToken = (session as any)?.secure?.accessToken

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'No Google token. Please re-login.' })
  }

  const body = await readBody(event)
  const spreadsheetId = body?.spreadsheetId

  if (!spreadsheetId) {
    throw createError({ statusCode: 400, statusMessage: 'spreadsheetId is required' })
  }

  const { clientEmail } = getServiceAccountCredentials()

  await $fetch(
    `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        sendNotificationEmail: 'false',
        supportsAllDrives: 'true',
      },
      body: {
        role: 'writer',
        type: 'user',
        emailAddress: clientEmail,
      },
    },
  )

  return { success: true }
})
