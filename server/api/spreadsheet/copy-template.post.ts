import { consola } from 'consola'
import { AppSettingsModel, DEFAULT_TEMPLATE_ID } from '~/server/models/AppSettings'
import { getServiceAccountCredentials } from '~/server/utils/googleSheets'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const session = await getUserSession(event)
  const accessToken = (session as any)?.secure?.accessToken

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'No Google token. Please re-login.' })
  }

  const body = await readBody(event)
  const { folderId, spreadsheetName } = body || {}

  if (!folderId || !spreadsheetName) {
    throw createError({ statusCode: 400, statusMessage: 'folderId and spreadsheetName are required' })
  }

  const settings = await AppSettingsModel.findOne({ key: 'singleton' }).lean()
  const templateId = settings?.spreadsheetTemplateId ?? DEFAULT_TEMPLATE_ID

  const copyResponse = await $fetch<{ id: string; name: string }>(
    `https://www.googleapis.com/drive/v3/files/${templateId}/copy`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        name: spreadsheetName,
        parents: [folderId],
      },
    },
  ).catch((err) => {
    throw createError({
      statusCode: 502,
      statusMessage: `Failed to copy template spreadsheet: ${err?.data?.error?.message || err.message}`,
    })
  })

  try {
    const { clientEmail } = getServiceAccountCredentials()
    await $fetch(
      `https://www.googleapis.com/drive/v3/files/${copyResponse.id}/permissions`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { sendNotificationEmail: 'false' },
        body: {
          role: 'writer',
          type: 'user',
          emailAddress: clientEmail,
        },
      },
    )
  }
  catch (err: any) {
    consola.error('Failed to share spreadsheet with service account:', err?.data?.error?.message || err.message)
  }

  return {
    id: copyResponse.id,
    name: copyResponse.name,
    url: `https://docs.google.com/spreadsheets/d/${copyResponse.id}/edit`,
    folderId,
    sourceTemplateId: templateId,
  }
})
