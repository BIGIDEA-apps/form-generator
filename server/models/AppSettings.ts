import mongoose, { Schema, type Document } from 'mongoose'

export const DEFAULT_TEMPLATE_ID = '1i7e8c3svxRI8CKFtNFXTuXe12iBLHcx57DhltYN4Gyw'
export const DEFAULT_TEMPLATE_NAME = 'Form-Generator-Template'

export interface IAppSettings extends Document {
  key: string
  defaultPrimaryLogo: string
  defaultPrimaryLogoSvgToWhite: boolean
  spreadsheetTemplateId: string
  spreadsheetTemplateName: string
  spreadsheetTemplateUrl: string
  columnMapping: Record<string, string>
}

const AppSettingsSchema = new Schema<IAppSettings>(
  {
    key: { type: String, unique: true, default: 'singleton' },
    defaultPrimaryLogo: { type: String, default: '/img/logos/bigidea-logo.svg' },
    defaultPrimaryLogoSvgToWhite: { type: Boolean, default: false },
    spreadsheetTemplateId: { type: String, default: DEFAULT_TEMPLATE_ID },
    spreadsheetTemplateName: { type: String, default: DEFAULT_TEMPLATE_NAME },
    spreadsheetTemplateUrl: {
      type: String,
      default: `https://docs.google.com/spreadsheets/d/${DEFAULT_TEMPLATE_ID}/edit`,
    },
    columnMapping: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

export const AppSettingsModel = mongoose.models.AppSettings as mongoose.Model<IAppSettings>
  || mongoose.model<IAppSettings>('AppSettings', AppSettingsSchema)
