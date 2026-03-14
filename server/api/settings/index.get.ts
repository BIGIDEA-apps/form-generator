import { AppSettingsModel, DEFAULT_TEMPLATE_ID, DEFAULT_TEMPLATE_NAME } from '~/server/models/AppSettings'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const doc = await AppSettingsModel.findOne({ key: 'singleton' }).lean()

  if (!doc) {
    return {
      defaultPrimaryLogo: '/img/logos/bigidea-logo.svg',
      defaultPrimaryLogoSvgToWhite: false,
      spreadsheetTemplateId: DEFAULT_TEMPLATE_ID,
      spreadsheetTemplateName: DEFAULT_TEMPLATE_NAME,
      spreadsheetTemplateUrl: `https://docs.google.com/spreadsheets/d/${DEFAULT_TEMPLATE_ID}/edit`,
      columnMapping: {},
    }
  }

  return {
    defaultPrimaryLogo: doc.defaultPrimaryLogo ?? '/img/logos/bigidea-logo.svg',
    defaultPrimaryLogoSvgToWhite: doc.defaultPrimaryLogoSvgToWhite ?? false,
    spreadsheetTemplateId: doc.spreadsheetTemplateId ?? DEFAULT_TEMPLATE_ID,
    spreadsheetTemplateName: doc.spreadsheetTemplateName ?? DEFAULT_TEMPLATE_NAME,
    spreadsheetTemplateUrl: doc.spreadsheetTemplateUrl ?? `https://docs.google.com/spreadsheets/d/${doc.spreadsheetTemplateId ?? DEFAULT_TEMPLATE_ID}/edit`,
    columnMapping: doc.columnMapping ?? {},
  }
})
