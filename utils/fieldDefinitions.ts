import type { FieldDefinition, FormPage } from '~/types/form'

export const DEFAULT_PRIMARY_LOGO = '/img/logos/bigidea-logo.png'

export const PAGE_DEFINITIONS: FormPage[] = [
  {
    key: 'page1',
    title: '',
    titleFieldKey: '',
    showTitle: true,
    fields: ['mainDescription', 'companyByUserString', 'companyByUserSelect'],
  },
  {
    key: 'page2',
    title: 'פרטי ההורה',
    titleFieldKey: 'page2Title',
    showTitle: true,
    fields: [
      'parentFirstName',
      'parentLastName',
      'parentFirstNameEn',
      'parentLastNameEn',
      'parenPhoneNumber',
      'additionalPhoneNumber',
      'parenEmail',
    ],
  },
]

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  // ─── Page 1 ───
  {
    key: 'mainDescription',
    label: 'טקסט ראשי',
    presentationLabel: '',
    inputType: 'display',
    requiredDefault: false,
    visibleDefault: true,
    infoText: '',
    placeholder: '',
    defaultValue:
      'אנא קראו בתשומת לב את המידע והפירוט על המסלולים השונים באתר לפני מילוי הטופס.\nשימו לב - יש למלא את הטופס בנפרד לכל ילד/ה',
    validation: null,
    options: [],
    page: 'page1',
    isInternalOnly: false,
  },
  {
    key: 'companyByUserString',
    label: 'שם החברה (טקסט)',
    presentationLabel: 'אנא ציינו את החברה בה אתם עובדים',
    inputType: 'shortText',
    requiredDefault: true,
    visibleDefault: false,
    infoText: '',
    placeholder: 'לדוגמה: גוגל',
    defaultValue: '',
    validation: null,
    options: [],
    page: 'page1',
    exclusiveWith: ['companyByUserSelect'],
  },
  {
    key: 'companyByUserSelect',
    label: 'שם החברה (בחירה)',
    presentationLabel: 'אנא ציינו את החברה בה אתם עובדים',
    inputType: 'select',
    requiredDefault: true,
    visibleDefault: false,
    infoText: '',
    placeholder: '',
    defaultValue: '',
    validation: null,
    options: [],
    page: 'page1',
    exclusiveWith: ['companyByUserString'],
  },

  // ─── Page 2: Parent Details ───
  {
    key: 'parentFirstName',
    label: 'שם פרטי של ההורה',
    presentationLabel: 'שם פרטי של ההורה',
    inputType: 'shortText',
    requiredDefault: true,
    visibleDefault: true,
    infoText: '',
    placeholder: '',
    defaultValue: '',
    validation: null,
    options: [],
    page: 'page2',
  },
  {
    key: 'parentLastName',
    label: 'שם משפחה של ההורה',
    presentationLabel: 'שם משפחה של ההורה',
    inputType: 'shortText',
    requiredDefault: true,
    visibleDefault: true,
    infoText: '',
    placeholder: '',
    defaultValue: '',
    validation: null,
    options: [],
    page: 'page2',
  },
  {
    key: 'parentFirstNameEn',
    label: 'שם פרטי של ההורה באנגלית',
    presentationLabel: 'שם פרטי של ההורה באנגלית',
    inputType: 'shortText',
    requiredDefault: true,
    visibleDefault: false,
    infoText: '',
    placeholder: '',
    defaultValue: '',
    validation: null,
    options: [],
    page: 'page2',
  },
  {
    key: 'parentLastNameEn',
    label: 'שם משפחה של ההורה באנגלית',
    presentationLabel: 'שם משפחה של ההורה באנגלית',
    inputType: 'shortText',
    requiredDefault: true,
    visibleDefault: false,
    infoText: '',
    placeholder: '',
    defaultValue: '',
    validation: null,
    options: [],
    page: 'page2',
  },
  {
    key: 'parenPhoneNumber',
    label: 'טלפון של ההורה',
    presentationLabel: 'טלפון של ההורה',
    inputType: 'shortText',
    requiredDefault: true,
    visibleDefault: true,
    infoText: 'ליצירת קשר',
    placeholder: '',
    defaultValue: '',
    validation: 'israeliPhone',
    options: [],
    page: 'page2',
  },
  {
    key: 'additionalPhoneNumber',
    label: 'טלפון נוסף',
    presentationLabel: 'טלפון נוסף ליצירת קשר במהלך הפעילות (אופציונלי)',
    inputType: 'shortText',
    requiredDefault: false,
    visibleDefault: true,
    infoText: '',
    placeholder: '',
    defaultValue: '',
    validation: null,
    options: [],
    page: 'page2',
  },
  {
    key: 'parenEmail',
    label: 'כתובת מייל של ההורה',
    presentationLabel: 'כתובת מייל של ההורה',
    inputType: 'shortText',
    requiredDefault: true,
    visibleDefault: true,
    infoText: '',
    placeholder: '',
    defaultValue: '',
    validation: 'email',
    options: [],
    page: 'page2',
  },
]

export function getDefaultFields(): Record<string, import('~/types/form').FieldConfig> {
  const fields: Record<string, import('~/types/form').FieldConfig> = {}

  for (const def of FIELD_DEFINITIONS) {
    fields[def.key] = {
      key: def.key,
      label: def.label,
      presentationLabel: def.presentationLabel,
      inputType: def.inputType,
      required: def.requiredDefault,
      visible: def.visibleDefault,
      infoText: def.infoText,
      placeholder: def.placeholder,
      defaultValue: def.defaultValue,
      validation: def.validation,
      options: [...def.options],
    }
  }

  return fields
}

export function getDefaultPages(): FormPage[] {
  return PAGE_DEFINITIONS.map(p => ({
    key: p.key,
    title: p.title,
    titleFieldKey: p.titleFieldKey,
    showTitle: p.showTitle ?? true,
    fields: [...p.fields],
  }))
}

export function getDefaultFormConfig(): Omit<import('~/types/form').FormConfig, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    slug: '',
    formName: 'טופס הרשמה לקייטנת BIGIDEA',
    formTitle: 'טופס הרשמה לקייטנת BIGIDEA',
    company: '',
    primaryLogo: DEFAULT_PRIMARY_LOGO,
    primaryLogoSvgToWhite: false,
    secondaryLogo: null,
    secondaryLogoSvgToWhite: false,
    mainDescription:
      'אנא קראו בתשומת לב את המידע והפירוט על המסלולים השונים באתר לפני מילוי הטופס.\nשימו לב - יש למלא את הטופס בנפרד לכל ילד/ה',
    pages: getDefaultPages(),
    fields: getDefaultFields(),
    isActive: true,
  }
}
