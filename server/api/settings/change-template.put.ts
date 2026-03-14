import { AppSettingsModel, DEFAULT_TEMPLATE_ID, DEFAULT_TEMPLATE_NAME } from '~/server/models/AppSettings'
import { FormModel } from '~/server/models/Form'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event) as {
    spreadsheetTemplateId: string
    spreadsheetTemplateName: string
    spreadsheetTemplateUrl: string
  }

  if (!body.spreadsheetTemplateId || !body.spreadsheetTemplateName || !body.spreadsheetTemplateUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Template id, name, and url are required' })
  }

  const currentSettings = await AppSettingsModel.findOne({ key: 'singleton' }).lean()
  const oldColumnMapping = currentSettings?.columnMapping ?? {}

  const migrateResult = await FormModel.updateMany(
    { columnMappingMode: { $in: ['default', undefined, null] } },
    {
      $set: {
        columnMappingMode: 'custom',
        columnMapping: oldColumnMapping,
      },
    },
  )

  const defaults = {
    key: 'singleton',
    defaultPrimaryLogo: '/img/logos/bigidea-logo.svg',
    defaultPrimaryLogoSvgToWhite: false,
    spreadsheetTemplateId: DEFAULT_TEMPLATE_ID,
    spreadsheetTemplateName: DEFAULT_TEMPLATE_NAME,
    spreadsheetTemplateUrl: `https://docs.google.com/spreadsheets/d/${DEFAULT_TEMPLATE_ID}/edit`,
    columnMapping: {},
  }

  const doc = await AppSettingsModel.findOneAndUpdate(
    { key: 'singleton' },
    {
      $set: {
        spreadsheetTemplateId: body.spreadsheetTemplateId,
        spreadsheetTemplateName: body.spreadsheetTemplateName,
        spreadsheetTemplateUrl: body.spreadsheetTemplateUrl,
        columnMapping: {},
      },
      $setOnInsert: defaults,
    },
    { returnDocument: 'after', upsert: true },
  ).lean()

  return {
    migratedCount: migrateResult.modifiedCount,
    settings: {
      defaultPrimaryLogo: doc.defaultPrimaryLogo ?? '/img/logos/bigidea-logo.svg',
      defaultPrimaryLogoSvgToWhite: doc.defaultPrimaryLogoSvgToWhite ?? false,
      spreadsheetTemplateId: doc.spreadsheetTemplateId ?? DEFAULT_TEMPLATE_ID,
      spreadsheetTemplateName: doc.spreadsheetTemplateName ?? DEFAULT_TEMPLATE_NAME,
      spreadsheetTemplateUrl: doc.spreadsheetTemplateUrl ?? `https://docs.google.com/spreadsheets/d/${doc.spreadsheetTemplateId ?? DEFAULT_TEMPLATE_ID}/edit`,
      columnMapping: doc.columnMapping ?? {},
    },
  }
})
