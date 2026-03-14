import { AppSettingsModel, DEFAULT_TEMPLATE_ID, DEFAULT_TEMPLATE_NAME } from '~/server/models/AppSettings'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event) as Record<string, unknown>

  const update: Record<string, unknown> = {}

  if (typeof body.defaultPrimaryLogo === 'string') {
    update.defaultPrimaryLogo = body.defaultPrimaryLogo
  }
  if (typeof body.defaultPrimaryLogoSvgToWhite === 'boolean') {
    update.defaultPrimaryLogoSvgToWhite = body.defaultPrimaryLogoSvgToWhite
  }
  if (typeof body.spreadsheetTemplateId === 'string') {
    update.spreadsheetTemplateId = body.spreadsheetTemplateId
  }
  if (typeof body.spreadsheetTemplateName === 'string') {
    update.spreadsheetTemplateName = body.spreadsheetTemplateName
  }
  if (typeof body.spreadsheetTemplateUrl === 'string') {
    update.spreadsheetTemplateUrl = body.spreadsheetTemplateUrl
  }
  if (body.columnMapping && typeof body.columnMapping === 'object' && !Array.isArray(body.columnMapping)) {
    update.columnMapping = body.columnMapping
  }

  if (Object.keys(update).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const defaults = {
    key: 'singleton',
    defaultPrimaryLogo: '/img/logos/bigidea-logo.svg',
    defaultPrimaryLogoSvgToWhite: false,
    spreadsheetTemplateId: DEFAULT_TEMPLATE_ID,
    spreadsheetTemplateName: DEFAULT_TEMPLATE_NAME,
    spreadsheetTemplateUrl: `https://docs.google.com/spreadsheets/d/${DEFAULT_TEMPLATE_ID}/edit`,
  }

  const doc = await AppSettingsModel.findOneAndUpdate(
    { key: 'singleton' },
    { $set: update, $setOnInsert: defaults },
    { returnDocument: 'after', upsert: true },
  ).lean()

  return {
    defaultPrimaryLogo: doc.defaultPrimaryLogo ?? '/img/logos/bigidea-logo.svg',
    defaultPrimaryLogoSvgToWhite: doc.defaultPrimaryLogoSvgToWhite ?? false,
    spreadsheetTemplateId: doc.spreadsheetTemplateId ?? DEFAULT_TEMPLATE_ID,
    spreadsheetTemplateName: doc.spreadsheetTemplateName ?? DEFAULT_TEMPLATE_NAME,
    spreadsheetTemplateUrl: doc.spreadsheetTemplateUrl ?? `https://docs.google.com/spreadsheets/d/${doc.spreadsheetTemplateId ?? DEFAULT_TEMPLATE_ID}/edit`,
    columnMapping: doc.columnMapping ?? {},
  }
})
