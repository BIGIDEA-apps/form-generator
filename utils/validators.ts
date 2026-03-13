export function validateIsraeliPhone(value: string): boolean {
  if (!value) return false
  const cleaned = value.replace(/[\s\-()]/g, '')
  return /^(0[2-9]\d{7,8}|(\+972)[2-9]\d{7,8})$/.test(cleaned)
}

export function validateEmail(value: string): boolean {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validateNumbersOnly(value: string): boolean {
  if (!value) return false
  return /^\d+$/.test(value)
}

export function validateField(value: string, validation: string | null): string | null {
  if (!validation) return null

  switch (validation) {
    case 'email':
      return validateEmail(value) ? null : 'כתובת מייל לא תקינה'
    case 'israeliPhone':
      return validateIsraeliPhone(value) ? null : 'מספר טלפון לא תקין'
    case 'numbersOnly':
      return validateNumbersOnly(value) ? null : 'יש להזין ספרות בלבד'
    default:
      return null
  }
}
